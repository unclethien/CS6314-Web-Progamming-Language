/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
//const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project8", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.use('/images', express.static('images'));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());
/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

// Add this after your session middleware
// eslint-disable-next-line consistent-return
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'User not logged in' });
  }
  next();
};

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", requireLogin, async function (request, response) {
  try {
    const users = await User.find({}, "_id first_name last_name"); // Select only necessary fields
    response.status(200).json(users);
  } catch (err) {
    console.error("Error fetching user list:", err);
    response.status(500).json(err);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
// eslint-disable-next-line consistent-return
app.get("/user/:id", requireLogin, async function (request, response) {
  const id = request.params.id;
  try {
    const user = await User.findById(id, "_id first_name last_name location description occupation"); // Select specific fields if needed
    if (!user) {
      console.log("User with _id:" + id + " not found.");
      return response.status(404).send("Not found");
    }
    response.status(200).json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    response.status(400).json(err);
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
// eslint-disable-next-line consistent-return
// eslint-disable-next-line consistent-return
app.get("/photosOfUser/:id", requireLogin, async function (request, response) {
  const userId = request.params.id;
  
  // Check if ID is valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return response.status(400).json({error: "Invalid user ID format"});
  }

  try {
    const photos = await Photo.find({ user_id: userId })
      .populate({
        path: 'comments.user_id',
        select: '_id first_name last_name location description occupation',
        model: 'User'  
      })
      .sort({ date_time: 1 })
      .lean();

    // Note: Changed from checking !photos to checking photos.length
    if (!photos || photos.length === 0) {
      console.log("Photos for user with _id:" + userId + " not found.");
      return response.status(400).json({error: "No photos found for user"});
    }

    const transformedPhotos = photos.map(photo => ({
      _id: photo._id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: photo.user_id,
      comments: photo.comments.map(comment => ({
        comment: comment.comment,
        date_time: comment.date_time,
        _id: comment._id,
        user: comment.user_id ? {
          _id: comment.user_id._id,
          first_name: comment.user_id.first_name,
          last_name: comment.user_id.last_name
        } : null
      }))
    }));

    return response.status(200).json(transformedPhotos);
  } catch (err) {
    console.error("Error fetching photos for user:", err);
    return response.status(400).json({error: err.message});
  }
});

// eslint-disable-next-line consistent-return
app.post("/admin/login", async (req, res) => {
  try {
    // Find user by login name
    const user = await User.findOne({ login_name: req.body.login_name });
    
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Verify password using the stored salt and provided password
    // eslint-disable-next-line no-use-before-define
    const isPasswordValid = password.doesPasswordMatch(
      user.password,  // stored hash
      user.salt,      // stored salt
      req.body.password  // provided password
    );

    if (!isPasswordValid) {
      return res.status(400).json({ error: "Wrong password" });
    }

    // Set up the session
    req.session.user = user;
    
    // Don't send password and salt in response
    const userWithoutPassword = user.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.salt;

    res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error('Error in login:', err);
    res.status(400).json({ error: err.message });
  }
});

// eslint-disable-next-line consistent-return
app.post("/admin/logout", (request, response) => {
  if (!request.session.user) {
    return response.status(400).json({error: "Not logged in"});
  }

  request.session.destroy((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return response.status(500).json({error: "Error during logout"});
    }
    response.clearCookie('connect.sid'); // Clear session cookie
    return response.status(200).json({message: "Logged out successfully"});
  });
});

app.post("/commentsOfPhoto/:photo_id", async (request, response) => {
  if (!request.session.user) {
    return response.status(401).send("User not logged in");
  }

  const photoId = request.params.photo_id;
  const { comment } = request.body;

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return response.status(404).send("Photo not found");
    }

    // Extract mentions from the comment
    const mentionRegex = /@\[(.*?)\]\((\w+)\)/g;
    const mentions = [];
    let match;
    match = mentionRegex.exec(comment);
    while (match !== null) {
      mentions.push(match[2]); // Extract the user ID from the mention
      match = mentionRegex.exec(comment);
    }
    photo.comments.push({
      comment: comment,
      user_id: request.session.user._id,
      date_time: new Date()
    });

    // Add mentions to the photo
    photo.mentions = [...new Set([...photo.mentions, ...mentions])];

    await photo.save();
    return response.status(200).send("Comment added successfully");
  } catch (err) {
    console.error("Error adding comment:", err);
    return response.status(400).send(JSON.stringify(err));
  }
});

// Endpoint to get all photos that mention a specific user
app.get("/photosWithMentions/:userId", async (request, response) => {
  const userId = request.params.userId;

  try {
    const photos = await Photo.find({ mentions: userId })
      .populate({
        path: 'comments.user_id',
        select: '_id first_name last_name location description occupation',
        model: 'User'
      })
      .sort({ date_time: 1 })
      .lean();

    if (!photos || photos.length === 0) {
      return response.status(400).json({ error: "No photos found with mentions for this user" });
    }

    const transformedPhotos = photos.map(photo => ({
      _id: photo._id,
      file_name: photo.file_name,
      date_time: photo.date_time,
      user_id: photo.user_id,
      comments: photo.comments.map(comment => ({
        comment: comment.comment,
        date_time: comment.date_time,
        _id: comment._id,
        user: comment.user_id ? {
          _id: comment.user_id._id,
          first_name: comment.user_id.first_name,
          last_name: comment.user_id.last_name
        } : null
      }))
    }));

    return response.status(200).json(transformedPhotos);
  } catch (err) {
    console.error("Error fetching photos with mentions for user:", err);
    return response.status(400).json({ error: err.message });
  }
});

// Make sure this is at the top with other requires
const password = require('./password');

// Update your registration endpoint
app.post('/admin/register', async (req, res) => {
  try {
    // Generate password hash and salt
    const passwordEntry = password.makePasswordEntry(req.body.password);
    
    // Create new user with the generated hash and salt
    const newUser = new User({
      login_name: req.body.login_name,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      location: req.body.location,
      description: req.body.description,
      occupation: req.body.occupation,
      password: passwordEntry.hash,
      salt: passwordEntry.salt  // Make sure this is included!
    });

    const savedUser = await newUser.save();
    
    // Don't send password and salt in response
    const userWithoutPassword = savedUser.toObject();
    delete userWithoutPassword.password;
    delete userWithoutPassword.salt;
    
    res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error('Error in registration:', err);
    res.status(400).json({ error: err.message });
  }
});

// Add this endpoint as an alias for /admin/register
// eslint-disable-next-line consistent-return
app.post("/user", async (request, response) => {
  try {
    const { login_name, password: plainPassword, first_name, last_name, location, description, occupation } = request.body;

    // Validate required fields
    if (!login_name || !plainPassword || !first_name || !last_name) {
      return response.status(400).json({ error: "Missing required fields" });
    }

    // Check for existing user
    const existingUser = await User.findOne({ login_name });
    if (existingUser) {
      return response.status(400).json({ error: "User already exists" });
    }

    const passwordEntry = password.makePasswordEntry(plainPassword);
    const newUser = await User.create({
      login_name,
      password: passwordEntry.hash,
      salt: passwordEntry.salt,
      first_name,
      last_name,
      location: location || "", 
      description: description || "",
      occupation: occupation || "" 
    });

    // Create new session
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line consistent-return
      request.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error:', err);
          return reject(err);
        }

        // Set session data
        request.session.user = {
          _id: newUser._id,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          login_name: newUser.login_name
        };

        // Save session
        // eslint-disable-next-line consistent-return, no-shadow
        request.session.save((err) => {
          if (err) {
            console.error('Session save error:', err);
            return reject(err);
          }

          // Send response after session is saved
          resolve(response.status(200).json({
            _id: newUser._id,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            login_name: newUser.login_name
          }));
        });
      });
    }).catch(err => {
      console.error('Session error:', err);
      return response.status(500).json({ error: "Session creation failed" });
    });

  } catch (err) {
    console.error('Registration error:', err);
    return response.status(500).json({ error: err.message });
  }
});

// Update the storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/'); // Make sure path is relative and without leading ./
  },
  filename: function (req, file, cb) {
    // Keep original filename to ensure we can find it later
    cb(null, file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Update the upload endpoint
app.post('/photos/new', requireLogin, upload.single('uploadedphoto'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No photo uploaded'});
  }

  try {
    const photo = new Photo({
      file_name: req.file.originalname, // Use original filename
      date_time: new Date(),
      user_id: req.session.user._id,
      comments: []
    });

    const savedPhoto = await photo.save();
    
    // Return full photo object
    return res.status(200).json({
      _id: savedPhoto._id,
      file_name: savedPhoto.file_name,
      date_time: savedPhoto.date_time,
      user_id: savedPhoto.user_id,
      comments: savedPhoto.comments
    });

  } catch (err) {
    console.error('Error uploading photo:', err);
    return res.status(400).json({error: err.message});
  }
});

// eslint-disable-next-line consistent-return
app.get('/api/session/check', async (req, res) => {
  if (req.session.user) {
    try {
      const user = await User.findById(req.session.user._id)
        .select('-password -salt');
      
      if (!user) {
        req.session.destroy();
        return res.status(401).json({ error: 'Invalid session' });
      }
      
      return res.json(user);
    } catch (err) {
      console.error('Session check error:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
  res.status(401).json({ error: 'No active session' });
});

app.delete("/photos/:photoId", requireLogin, async (request, response) => {
  const photoId = request.params.photoId;
  const userId = request.session.user._id;

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return response.status(404).send("Photo not found");
    }

    if (photo.user_id.toString() !== userId.toString()) {
      return response.status(403).send("You do not have permission to delete this photo");
    }

    await Photo.findByIdAndDelete(photoId);
    return response.status(200).send("Photo deleted successfully");
  } catch (err) {
    console.error("Error deleting photo:", err);
    return response.status(400).send("Error deleting photo");
  }
});

app.delete("/comments/:commentId", requireLogin, async (request, response) => {
  const commentId = request.params.commentId;
  const userId = request.session.user._id;

  try {
    // Find the photo that contains the comment
    const photo = await Photo.findOne({ "comments._id": commentId });
    if (!photo) {
      return response.status(404).send("Comment not found");
    }

    // Find the comment in the photo's comments array
    const comment = photo.comments.id(commentId);
    if (!comment) {
      return response.status(404).send("Comment not found");
    }

    // Check if the user is the owner of the comment
    if (comment.user_id.toString() !== userId.toString()) {
      return response.status(403).send("You do not have permission to delete this comment");
    }

    // Remove the comment from the photo's comments array
    photo.comments = photo.comments.filter(c => c._id.toString() !== commentId); // Filter out the comment

    // Save the updated photo
    await photo.save();
    return response.status(200).send("Comment deleted successfully");
  } catch (err) {
    console.error("Error deleting comment:", err);
    return response.status(400).send("Error deleting comment");
  }
});

app.delete("/user", requireLogin, async (request, response) => {
  const userId = request.session.user._id;

  // Confirmation step (you can implement this in the frontend)
  // For example, you can send a confirmation message to the user before proceeding.

  try {
    // Delete all photos associated with the user
    await Photo.deleteMany({ user_id: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Log the user out
    request.session.destroy();

    return response.status(200).send("User account deleted successfully");
  } catch (err) {
    console.error("Error deleting user account:", err);
    return response.status(400).send("Error deleting user account");
  }
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});

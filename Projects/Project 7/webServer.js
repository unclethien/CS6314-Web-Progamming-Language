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
mongoose.connect("mongodb://127.0.0.1/project7", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

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
        select: '_id first_name last_name location description occupation'
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
          last_name: comment.user_id.last_name,
          location: comment.user_id.location || "",
          description: comment.user_id.description || "",
          occupation: comment.user_id.occupation || ""
        } : null
      }))
    }));

    return response.status(200).json(transformedPhotos);
  } catch (err) {
    console.error("Error fetching photos for user:", err);
    return response.status(400).json({error: err.message});
  }
});

app.post("/admin/login", async (request, response) => {
  const { login_name, password } = request.body;
  
  if (!login_name || !password) {
    return response.status(400).json({error: "Missing login_name or password"});
  }

  try {
    const user = await User.findOne(
      { login_name: login_name, password: password },
      "_id first_name last_name"
    );

    if (!user) {
      return response.status(400).json({error: "Invalid credentials"});
    }

    // Store user info in session
    request.session.user = {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    };

    return response.status(200).json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name
    });
  } catch (err) {
    console.error("Error in login:", err);
    return response.status(500).json({error: "Internal server error"});
  }
});

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

    photo.comments.push({
      comment: comment,
      user_id: request.session.user._id,
      date_time: new Date()
    });

    await photo.save();
    return response.status(200).send("Comment added successfully");
  } catch (err) {
    console.error("Error adding comment:", err);
    return response.status(400).send(JSON.stringify(err));
  }
});

app.post("/admin/register", async (request, response) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

  // Validate required fields
  if (!login_name || !password || !first_name || !last_name) {
    return response.status(400).send("Missing required fields");
  }

  try {
    // Check if user already exists - use case-insensitive search
    const existingUser = await User.findOne({ 
      login_name: { $regex: new RegExp(`^${login_name}$`, 'i') } 
    });
    
    if (existingUser) {
      return response.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = await User.create({
      login_name,
      password,
      first_name,
      last_name,
      location: location, 
      description: description,
      occupation: occupation 
    });

    // Log the user in by creating a session
    request.session.user = { _id: newUser._id, first_name: newUser.first_name };

    // Return user data
    return response.status(200).json({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });

  } catch (err) {
    console.error("Error in registration:", err);
    return response.status(500).send("Internal Server Error");
  }
});

// Add this endpoint as an alias for /admin/register
app.post("/user", async (request, response) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = request.body;

  // Validate required fields
  if (!login_name || !password || !first_name || !last_name) {
    return response.status(400).send("Missing required fields");
  }

  try {
    // Check if user already exists - use case-insensitive search
    const existingUser = await User.findOne({ 
      login_name: { $regex: new RegExp(`^${login_name}$`, 'i') } 
    });
    
    if (existingUser) {
      return response.status(400).json({ error: "User already exists" });
    }

    // Create new user
    const newUser = await User.create({
      login_name,
      password,
      first_name,
      last_name,
      location: location || "", 
      description: description || "",
      occupation: occupation || "" 
    });

    // Return user data
    return response.status(200).json({
      _id: newUser._id,
      first_name: newUser.first_name,
      last_name: newUser.last_name
    });

  } catch (err) {
    console.error("Error in registration:", err);
    return response.status(500).send("Internal Server Error");
  }
});

// Upload 
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './images/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename using timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, `${uniqueSuffix}.${extension}`);
  }
});

const upload = multer({ storage: storage });

// eslint-disable-next-line consistent-return
app.post('/photos/new', requireLogin, upload.single('uploadedphoto'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({error: 'No photo uploaded'});
  }

  try {
    const photo = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: req.session.user._id,
      comments: []
    });

    await photo.save();
    res.status(200).json(photo);
  } catch (err) {
    console.error('Error uploading photo:', err);
    res.status(400).json({error: err.message});
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

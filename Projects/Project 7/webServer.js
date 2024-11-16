const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");
const express = require("express");
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const app = express();
const bcrypt = require("bcrypt");

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");
const upload = multer({ storage: multer.memoryStorage() });

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

app.use(
  session({ secret: "secretKey", resave: false, saveUninitialized: false })
);
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
    try {
      const info = await SchemaInfo.find({});
      if (info.length === 0) {
        // No SchemaInfo found - return 500 error
        return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch (err) {
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

/**
 * URL /user/list - Returns all the User objects with their photo and comment counts.
 */
app.get("/user/list", async function (request, response) {
  if (!request.session.user) return response.status(401).send("Unauthorized");
  try {
    const users = await User.find(
      {},
      { _id: 1, first_name: 1, last_name: 1 }
    ).lean();
    return response.status(200).json(users);
  } catch (err) {
    console.error("Error in /user/list:", err);
    return response.status(500).json(err);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
  if (!request.session.user) return response.status(401).send("Unauthorized");
  const id = request.params.id;
  try {
    const users = await User.findById(id, {
      _id: 1,
      first_name: 1,
      last_name: 1,
      location: 1,
      description: 1,
      occupation: 1,
    });
    if (!users) {
      console.log("User with _id:" + id + " not found.");
      return response.status(400).send("Not found");
    }
    return response.status(200).send(users);
  } catch (err) {
    console.error("Error in /user/list:", err);
    return response.status(400).send("Invalid user id");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  if (!request.session.user) return response.status(401).send("Unauthorized");
  const userId = request.params.id;
  try {
    const photos = await Photo.find(
      { user_id: userId },
      {
        _id: 1,
        user_id: 1,
        file_name: 1,
        date_time: 1,
        comments: 1,
      }
    ).lean(); // Use lean() for plain JS objects

    if (photos.length === 0) {
      console.log("Photos for user with _id:" + userId + " not found.");
      return response.status(404).send("Not found");
    }

    // Fetch user details for each comment
    const commentUserIds = new Set();
    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        commentUserIds.add(comment.user_id);
      });
    });

    const users = await User.find(
      { _id: { $in: Array.from(commentUserIds) } },
      { _id: 1, first_name: 1, last_name: 1 }
    ).lean();

    const userMap = new Map();
    users.forEach((user) => {
      userMap.set(user._id.toString(), user);
    });

    // Ensure that each comment has a user object, even if it's empty
    const transformedPhotos = photos.map((photo) => ({
      ...photo,
      comments: photo.comments.map((comment) => ({
        _id: comment._id,
        comment: comment.comment,
        date_time: comment.date_time,
        user: userMap.get(comment.user_id.toString()) || {},
      })),
    }));

    return response.status(200).json(transformedPhotos);
  } catch (err) {
    console.error("Error fetching photos for user:", err);
    return response.status(400).json(err);
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

/**
 * URL /user/:id/photoCount - Returns the number of photos for User (id).
 */
app.get("/user/:id/photoCount", async function (request, response) {
  if (!request.session.user) return response.status(401).send("Unauthorized");
  const userId = request.params.id;
  try {
    const photoCount = await Photo.countDocuments({ user_id: userId });
    return response.status(200).json({ count: photoCount });
  } catch (err) {
    console.error("Error fetching photo count for user:", err);
    return response.status(400).json(err);
  }
});

/**
 * URL /user/:id/commentCount - Returns the count of comments authored by the user with _id of id.
 */
app.get("/user/:id/commentCount", async function (request, response) {
  if (!request.session.user) return response.status(401).send("Unauthorized");
  const userId = request.params.id;
  try {
    const photos = await Photo.find({ "comments.user_id": userId });
    const commentCount = photos.reduce((count, photo) => {
      const userComments = photo.comments.filter(
        (comment) => comment.user_id.toString() === userId
      );
      return count + userComments.length;
    }, 0);

    return response.status(200).json({ count: commentCount });
  } catch (err) {
    console.error("Error fetching comment count for user:", err);
    return response.status(400).json(err);
  }
});

/**
 * URL /user/:id/comments - Returns all comments authored by the user with _id of id.
 */
app.get("/user/:id/comments", async function (request, response) {
  if (!request.session.user) return response.status(401).send("Unauthorized");
  const userId = request.params.id;
  try {
    const photos = await Photo.find({ "comments.user_id": userId }).lean();
    const userComments = [];

    photos.forEach((photo) => {
      photo.comments.forEach((comment) => {
        if (comment.user_id.toString() === userId) {
          userComments.push({
            _id: comment._id,
            comment: comment.comment,
            photo: {
              _id: photo._id,
              file_name: photo.file_name,
            },
            date_time: comment.date_time,
          });
        }
      });
    });

    if (userComments.length === 0) {
      console.log("Comments for user with _id:" + userId + " not found.");
      return response.status(400).send("Not found");
    }

    return response.status(200).json(userComments);
  } catch (err) {
    console.error("Error fetching comments for user:", err);
    return response.status(400).json(err);
  }
});

app.post("/admin/login", async function (request, response) {
  const { login_name, password } = request.body;
  try {
    const user = await User.findOne({ login_name });
    if (!user) {
      return response.status(400).send("Login failed: Invalid login_name");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(400).send("Login failed: Invalid password");
    }

    request.session.user = {
      _id: user._id,
      first_name: user.first_name,
      login_name: user.login_name,
    };
    return response.status(200).send(request.session.user);
  } catch (err) {
    return response.status(500).send("Internal server error");
  }
});

app.post("/admin/logout", async function (request, response) {
  if (request.session.user) {
    request.session.destroy();
    return response.status(200).send("Logged out");
  } else {
    return response.status(400).send("No user logged in");
  }
});

app.post("/commentsOfPhoto/:photo_id", async function (request, response) {
  if (!request.session.user) return response.status(401).send("Unauthorized");
  const { comment } = request.body;
  if (!comment) return response.status(400).send("Comment cannot be empty");

  try {
    const photo = await Photo.findById(request.params.photo_id);
    photo.comments.push({ user_id: request.session.user._id, comment });
    await photo.save();
    return response.status(200).send(photo);
  } catch (err) {
    return response.status(500).send("Internal server error");
  }
});

app.post(
  "/photos/new",
  upload.single("uploadedphoto"),
  async function (request, response) {
    if (!request.session.user) return response.status(401).send("Unauthorized");
    if (!request.file) return response.status(400).send("No file uploaded");

    try {
      const fileName = `U${Date.now()}_${request.file.originalname}`;
      fs.writeFileSync(`./images/${fileName}`, request.file.buffer);

      const newPhoto = new Photo({
        user_id: request.session.user._id,
        file_name: fileName,
      });
      await newPhoto.save();
      return response.status(201).send(newPhoto);
    } catch (err) {
      return response.status(500).send("Internal server error");
    }
  }
);

app.post("/user", async function (request, response) {
  const {
    login_name,
    password,
    first_name,
    last_name,
    location,
    description,
    occupation,
  } = request.body;
  if (!login_name || !password || !first_name || !last_name) {
    return response.status(400).send("All fields are required");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      login_name,
      password: hashedPassword,
      first_name,
      last_name,
      location,
      description,
      occupation,
    });
    await newUser.save();
    return response
      .status(201)
      .send({ message: "User registered successfully" });
  } catch (err) {
    return response.status(500).send("Internal server error");
  }
});

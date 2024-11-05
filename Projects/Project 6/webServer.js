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

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
// const models = require("./modelData/photoApp.js").models;
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
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function (request, response) {
  try {
    const users = await User.find({}, { _id: 1, first_name: 1, last_name: 1 });
    response.status(200).json(users);
  } catch (err) {
    console.error("Error in /user/list:", err);
    response.status(500).json(err);
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
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
      response.status(400).send("Not found");
      return;
    }
    response.status(200).send(users);
  } catch (err) {
    console.error("Error in /user/list:", err);
    response.status(400).send("Invalid user id");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
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
  const userId = request.params.id;
  try {
    const photoCount = await Photo.countDocuments({ user_id: userId });
    response.status(200).json(photoCount);
  } catch (err) {
    console.error("Error fetching photo count for user:", err);
    response.status(400).json(err);
  }
});

/**
 * URL /user/:id/photoCount - Returns the number of photos for User (id).
 */
app.get("/user/:id/photoCount", async function (request, response) {
  const userId = request.params.id;
  try {
    const photoCount = await Photo.countDocuments({ user_id: userId });
    response.status(200).json({ count: photoCount });
  } catch (err) {
    console.error("Error fetching photo count for user:", err);
    response.status(400).json(err);
  }
});

/**
 * URL /user/:id/commentCount - Returns the count of comments authored by the user with _id of id.
 */
app.get("/user/:id/commentCount", async function (request, response) {
  const userId = request.params.id;
  try {
    const commentCount = await Comment.countDocuments({ user_id: userId });
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
  const userId = request.params.id;
  try {
    const comments = await Comment.find({ user_id: userId })
      .populate({
        path: "photo",
        select: { _id: 1, file_name: 1 },
      })
      .lean();

    if (comments.length === 0) {
      console.log("Comments for user with _id:" + userId + " not found.");
      return response.status(404).send("Not found");
    }

    return response.status(200).json(comments);
  } catch (err) {
    console.error("Error fetching comments for user:", err);
    return response.status(400).json(err);
  }
});

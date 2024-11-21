"use strict";

const mongoose = require("mongoose");

/**
 * Define the Mongoose Schema for a Comment.
 */
const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  location: String,
  description: String,
  occupation: String,
<<<<<<< HEAD
  login_name: { 
    type: String, 
    required: true, 
    unique: true,
    uniqueCaseInsensitive: true 
  },
  password: { type: String, required: true },
  salt: { type: String, required: true }
});

// Modify the pre-save hook to skip for initial loading
// eslint-disable-next-line consistent-return
userSchema.pre('save', async function(next) {
  // Skip duplicate check if we're loading the database
  if (process.env.LOADING_DATABASE === 'true') {
    return next();
  }

  // Only check for duplicates if the login_name is being modified
  if (this.isModified('login_name')) {
    try {
      const user = await this.constructor.findOne({ 
        login_name: { $regex: new RegExp(`^${this.login_name}$`, 'i') },
        _id: { $ne: this._id } // Exclude current document
      });
      
      if (user) {
        const err = new Error('User already exists');
        err.code = 11000;
        throw err;
      }
    } catch (error) {
      return next(error);
    }
  }
  
  next();
=======
  login_name: { type: String, required: true, unique: true },
  password: { type: String, required: true }
>>>>>>> 18549f5b76820363b422b7f99bffbbfc522e49ff
});

/**
 * Create a Mongoose Model for a User using the userSchema.
 */
const User = mongoose.model("User", userSchema);

/**
 * Make this available to our application.
 */
module.exports = User;

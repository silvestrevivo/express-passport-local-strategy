'use strict'

const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// User Schema
const UserSchema = mongoose.Schema({
  username: {
    type: String,
    index: true,
  },
  password: {
    type: String,
  },
  email: {
    type: String,
  },
  name: {
    type: String,
  },
})

const User = (module.exports = mongoose.model('User', UserSchema))

module.exports.createUser = function(newUser, callback) {
  // the function createUser, is going to encrypt the password
  // that is calles 'hash'. This encrypted password will be in the
  // mongoDB data base
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(newUser.password, salt, function(err, hash) {
      // we want to have encrypted the user password
      if (err) {
        throw err
      } else {
        newUser.password = hash
        console.log('this is the new User encrypted', newUser)
        // save is a funcion from mongoose
        newUser.save(callback)
        console.log('callback sent')
      }
    })
  })
}

// Controllers
module.exports.getUserByUsername = function(username, callback) {
  let query = { username: username }
  User.findOne(query, callback)
}

module.exports.getUserById = function(id, callback) {
  User.findById(id, callback)
}

module.exports.comparePassword = function(candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    if (err) throw err
    callback(null, isMatch)
  })
}

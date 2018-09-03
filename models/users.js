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

module.exports.createUser = (newUser, callback) => {
  // the function createUser, is going to encrypt the password
  // that is calles 'hash'. This encrypted password will be in the
  // mongoDB data base
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      // we want to have encrypted the user password
      if (err) {
        throw err
      } else {
        newUser.password = hash
        /*
        we save the newUser with the password encrypted
        save() is a funcion from mongoose
        */
        newUser.save(callback)
      }
    })
  })
}

// Controllers using mongoose functions
module.exports.getUserByUsername = (username, callback) => {
  let query = { username: username }
  User.findOne(query, callback)
}

module.exports.getUserById = (id, callback) => {
  User.findById(id, callback)
}

module.exports.comparePassword = (candidatePassword, hash, callback) => {
  bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
    if (err) throw err
    callback(null, isMatch)
  })
}

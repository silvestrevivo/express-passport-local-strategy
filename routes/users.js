'use strict'

const express = require('express')
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/users') // we bring user from models

// Register page
router.get('/register', (req, res) => {
  res.render('register')
})

// Login page
router.get('/login', (req, res) => {
  res.render('login')
})

// Register User
router.post('/register', (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const username = req.body.username
  const password = req.body.password
  const password2 = req.body.password2

  // Validation with expressValidator middleware
  req.checkBody('name', 'Name is required').notEmpty()
  req.checkBody('email', 'Email is required').notEmpty()
  req.checkBody('email', 'Email is not valid').isEmail()
  req.checkBody('username', 'Username is required').notEmpty()
  req.checkBody('password', 'Password is required').notEmpty()
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password)

  const errors = req.validationErrors() // expressValidator error function

  if (errors) {
    //expressValidator displays the errors in the handlebars
    res.render('register', {
      errors: errors,
    })
  } else {
    // checking for email and username are already taken using mongoose
    User.findOne({ username: {
      "$regex": "^" + username + "\\b", "$options": "i"
    }}, function (err, user) {
      User.findOne({ email: {
        "$regex": "^" + email + "\\b", "$options": "i"
      }}, function (err, mail) {
        if(user || mail){
          res.render('register', {
            user: user,
            mail: mail
          })
        } else {
          let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
          })

          User.createUser(newUser, (err, user) =>{
            if (err) throw err;
            console.log(user);

            req.flash('success_msg', 'You are registered and can now login');

            res.redirect('/users/login');
          })
        }
      })
    })
  }
})

// Passport Local Strategy to Loggin, not to register a new user
passport.use(
  new LocalStrategy(function(username, password, done) {
    User.getUserByUsername(username, function(err, user) {
      if (err) throw err
      if (!user) {
        return done(null, false, { message: 'Unknown User' })
      }

      User.comparePassword(password, user.password, function(err, isMatch) {
        if (err) throw err
        if (isMatch) {
          return done(null, user)
        } else {
          return done(null, false, { message: 'Invalid password' })
        }
      })
    })
  }),
)

passport.serializeUser(function(user, done) {
  done(null, user.id)
})

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user)
  })
})

router.post(
  '/login',
  passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/')
  },
)
/*
  once we determinate to use passport as strategy to login, we use it as
  middleware with passport.use(). Because in app.js, the middleware is already
  initialized with app.use(passport.initialize())
*/

// Logout
router.get('/logout', (req, res) => {
  req.logout()

  req.flash('success_msg', 'You are logged out')

  res.redirect('/users/login')
})

module.exports = router

'use strict'

const express = require('express')
const router = express.Router()
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy

const User = require('../models/users')

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
    const newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
    })

    User.createUser(newUser, (err, user) => {
      if (err) throw err

      req.flash('success_msg', 'Your are registered and can now login')

      res.redirect('/users/login')
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

module.exports = router

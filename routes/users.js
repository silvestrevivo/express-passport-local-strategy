'use strict'

const express = require('express')
const router = express.Router()
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
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  // Validation
  req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  const errors = req.validationErrors()

  if(errors){
    res.render('register', {
      errors: errors
    })
  } else {
    const newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password
    })

    User.createUser(newUser, (err, user) => {
      if(err) throw err;
      console.log('this is the user', user)
    })

    req.flash('success_msg', 'Your are registered and can now login')

    res.redirect('/users/login')
  }
})

module.exports = router

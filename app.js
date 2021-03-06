'use strict'

const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const mongoose = require('mongoose')
const { mLabDataBase } = require('./config/config')

// connecting to data base
mongoose.connect(mLabDataBase, { useNewUrlParser: true })
const db = mongoose.connection

const routes = require('./routes/index')
const users = require('./routes/users')

// Init App
const app = express()

// View engine
app.set('views', path.join(__dirname, 'views'))
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }))
app.set('view engine', 'handlebars')

// BodyParser Middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')))

// Express Session
app.use(
  session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true,
  }),
)

// Passport init
app.use(passport.initialize())
app.use(passport.session())

// Express Validator
app.use(
  expressValidator({
    errorFormatter: (param, msg, value) => {
      var namespace = param.split('.'),
        root = namespace.shift(),
        formParam = root

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']'
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      }
    },
  }),
)

// Connect Flash
app.use(flash())

// Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  res.locals.user = req.user || null
  next()
})

app.use('/', routes)
app.use('/users', users)

// Set Port to fire server
app.set('port', process.env.PORT || 3000)

// Once the connection is done, the server gets fired
// Otherwise the app is not able to run
db.once('open', () => {
  // making the app listening to port
  app.listen(app.get('port'), ()  => {
    console.log(`Server started on port ${app.get('port')}`)
  })
}).on('error', error => {
  return console.warn(`Error connecting to the data base: ${error}`)
})

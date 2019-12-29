const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const expressValidator = require('express-validator');
const { check, validationResult } = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database')

const localStrategy = require('passport-local');

mongoose.connect(config.database);
let db = mongoose.connection;

//check conncetion
db.once('open', function(){
    console.log('connected to Mongo DB');
})
//checking for db errors
db.on('error', function(err){
console.log(err);
});

//init app
const app = express()

//bring in models
let Article = require('./models/article');


//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//body parser
app.use(bodyParser.urlencoded({ extended:false }))
app.use(bodyParser.json())

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }))

  //express messages middleware
  app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//express-validator middleware

//passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
res.locals.user = req.user || null;
next();
});


//hom route
app.get('/', function(req, res){
    Article.find({}, function(err, articles){
        if(err){
            console.log(err);
        }else{
            res.render('index',{
                title:'Hello',
                articles:articles
            });
        }
        
    });
});

//ROuter files
const articles = require('./routes/articles');
const users = require('./routes/users');
app.use('/articles',articles);
app.use('/users',users);

//start server
app.listen(3000, function(){
    console.log('server started in Port 3000');
})

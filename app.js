var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var bodyParser = require('body-parser');

var db = require('./data/db');

var index = require('./routes/index');
var users = require('./routes/users');
var secrets = require('./routes/secrets');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Authentication middleware
// Check that the user's session passed in req.session is valid
app.use(function(req, res, next) {
    if (req.session.userId) {
        var users = db.get('users');
        users.findOne({
            _id: req.session.userId
        }, function(err, user) {
            if (user) {
                req.currentUser = user;
            } else {
                delete req.session.userId;
            }
            next();
        });
    } else {
        next();
    }
});

app.use('/', index);
app.use('/users', users);
app.use('/secrets', secrets);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500).end();
});

module.exports = app;

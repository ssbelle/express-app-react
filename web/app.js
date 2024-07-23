var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
require("dotenv").config()

const indexRouter = require('./routes/index');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const watchlistRoutes = require('./routes/watchlist');
const templatesRoutes = require('./routes/templates');
const agentsRoutes = require('./routes/agents');
const companyRoutes = require('./routes/company');
const chatboxRoutes = require('./routes/chatbox');
const spaceRoutes = require('./routes/space');
const integrationRoutes = require('./routes/integrations');

const react_build = express.static(path.join(__dirname, 'dist'));

var app = express();
/*app.use(helmet());*/

// view engine setup
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//TODO: Make this configurable
app.use(cookieParser("t7AjtDdBwBXu94Y9"));
app.use(express.static(path.join(__dirname, 'public')));
// TODO: Attempting to bring in the compiled react
app.use('/static', express.static(path.join(__dirname, 'dist')));

app.use('/', indexRouter);
app.use('/auth', authRoutes);
app.use('/search', searchRoutes);
app.use('/watchlist', watchlistRoutes);
app.use('/templates', templatesRoutes);
app.use('/agents', agentsRoutes);
app.use('/company', companyRoutes);
app.use('/chatbox', chatboxRoutes);
app.use('/space', spaceRoutes);
app.use('/integrations', integrationRoutes);

// TODO: Attempting to bring in the compiled react for search route
// May need to remove the header and sidebar in react version depending on how this serves or where we can mount the react
app.use('/static', (req, res) => {
  res.sendFile('index.js');
});

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.send('error');
});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
module.exports = app;

const path = require('path');
const compression = require('compression');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const errorHandler = require('errorhandler');
require("console-stamp")(console, 'yyyy/mm/dd HH:MM:ss.l');
const NedbStore = require('nedb-session-store')(session);

const user = require('./controllers/user');
const config = require('./config.js');

let isDebugMode = config.isDebugMode;
console.debug = function (args) {
  if (isDebugMode) {
    console.log(args);
  }
}

let app = express();
app.disable('x-powered-by');
app.disable('etag');
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(session({
  secret: config.encryptKey,
  name: 'humpback.session.id',
  resave: true,
  saveUninitialized: true,
  store: new NedbStore({
    filename: path.join(__dirname, `./dbFiles/${config.dbConfigs.sessionCollection.name}.db`),
  })
}));
app.use(compression());

app.use((req, res, next) => {
  let ext = path.extname(req.url);
  if (ext && ext.length > 6) ext = null;
  if (req.method === 'GET' && !req.url.startsWith('/api') && !ext) {
    req.url = '/index.html';
  }
  next();
});
app.use('/', express.static(path.join(__dirname, 'client')));
app.use('/public/avatar', express.static(path.join(__dirname, 'public/avatar')));

app.get('/humpback-backend-faq', (req, res, next) => {
  res.json(config);
  return;
});

let ignoreAuthPaths = [
  '/api/users/islogin',
  '/api/users/login',
  '/api/users/logout',
  '/api/users/avatar',
  '/api/system-config',
  '/api/groups/getclusters',
  '/api/groups/getallservers',
  '/api/dashboard'
];

app.all('/api/*', (req, res, next) => {
  let ignored = false;
  for (let i = 0; i < ignoreAuthPaths.length; i++) {
    if (req.path.startsWith(ignoreAuthPaths[i])) {
      ignored = true;
    }
  }
  if (ignored) {
    return next();
  }
  if (req.session.currentUser && req.session.currentUser.UserID) {
    if (req.session.cookie.originalMaxAge && req.session.cookie.originalMaxAge < (20 * 60 * 1000)) {
      req.session.cookie.maxAge = 20 * 60 * 1000;
    }
    return next();
  } else {
    error = new Error('UnAuthorization. Not login.');
    error.statusCode = 401;
    return next(error);
  }
});

app.use('/api/users', require('./routers/user'));
app.use('/api/groups', require('./routers/group'));
app.use('/api/images', require('./routers/imageInfo'));
app.use('/api/logs', require('./routers/log'));
app.use('/api/system-config', require('./routers/systemConfig'));
app.use('/api/dashboard', require('./routers/dashboard'));

errorHandler.title = `Humpback WebSite - ${config.version}`;
app.use(errorHandler({ log: false }));

console.debug('Init system...');
user.initAdmin()
  .then(() => {
    app.listen(config.listenPort, () => {
      console.debug('Init system succeed');
      console.log(`Humpback Website is started on port ${config.listenPort}`);
    });
  })
  .catch(err => {
    console.log(`System init failed. Error: ${err}`);
    process.exit(-101);
  });




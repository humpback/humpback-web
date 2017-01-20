const util = require('./../common/util');
const config = require('./../config');

exports.validateLogin = (req, res, next) => {
  if (!req.body.UserID) {
    return next(new Error("'UserID' cannot be empty."));
  }
  if (!req.body.Password) {
    return next(new Error("'Password' cannot be empty."));
  }
  next();
}

exports.validateRegister = (req, res, next) => {
  if (!req.body.UserID) {
    return next(new Error("'UserID' cannot be empty."));
  }
  if (!req.body.Password) {
    return next(new Error("'Password' cannot be empty."));
  }
  if (!req.body.FullName) {
    return next(new Error("'FullName' cannot be empty."));
  }
  next();
}

exports.validateUpdate = (req, res, next) => {
  if (!req.body.FullName) {
    return next(new Error("'FullName' cannot be empty."));
  }
  next();
}

exports.validateResetPassword = (req, res, next) => {
  if (!req.body.UserID) {
    return next(new Error("'UserID' cannot be empty."));
  }
  next();
}

exports.validateChangePassword = (req, res, next) => {
  if (!req.body.UserID) {
    return next(new Error("'UserID' cannot be empty."));
  }
  if (!req.body.OldPassword) {
    return next(new Error("'OldPassword' cannot be empty."));
  }
  if (!req.body.NewPassword) {
    return next(new Error("'NewPassword' cannot be empty."));
  }
  next();
}

exports.isAdmin = (req, res, next) => {
  if (!req.session.currentUser.IsAdmin) {
    let err = new Error("UnAthorization: Not Admin.")
    err.statusCode = 401;
    return next(err);
  }
  next();
}
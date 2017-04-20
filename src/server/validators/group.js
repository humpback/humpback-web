exports.validate = (req, res, next) => {
  let group = req.body;
  if (req.method === 'PUT' && !group.ID) {
    return next(new Error("'ID' must not be empty."));
  }
  if (!group.Name) {
    return next(new Error("'Name' must not be empty."));
  }
  if (!group.Owners) {
    return next(new Error("'Owners' must not be empty."));
  }
  next()
}

exports.validateGetCluster = (req, res, next) => {
  let header = req.headers['x-get-cluster'];
  if (!header) {
    let err = new Error("UnAthorization")
    err.statusCode = 401;
    return next(err);
  }
  if (!validateTime(header)) {
    let err = new Error("UnAthorization")
    err.statusCode = 401;
    return next(err);
  }
  next();
}

exports.validateGetAllServers = (req, res, next) => {
  let header = req.headers['x-get-allservers'];
  if (!header) {
    let err = new Error("UnAthorization")
    err.statusCode = 401;
    return next(err);
  }
  if (!validateTime(header)) {
    let err = new Error("UnAthorization")
    err.statusCode = 401;
    return next(err);
  }
  next();
}

let validateTime = (header) => {
  let decode = Buffer.from(header, 'base64').toString().replace('HUMPBACK_CENTER', '');
  let now = new Date().valueOf();
  if ((now - parseInt(decode)) > 30 * 60 * 1000) {
    return false;
  }
  return true;
}

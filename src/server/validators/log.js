exports.validate = (req, res, next) => {
  let log = req.body;
  if (!log.Type) {
    return next(new Error("'Type' must not be empty."));
  }
  if (!log.Content) {
    return next(new Error("'Content' must not be empty."));
  }
  next();
}
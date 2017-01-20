exports.validate = (req, res, next) => {
  let imageInfo = req.body;
  if (!imageInfo.Name) {
    return next(new Error("'Name' must not be empty."));
  }
  if (!imageInfo.Description && !imageInfo.Dockerfile) {
    return next(new Error("'Description' or 'Dockerfile' must not be empty."));
  }
  next();
}
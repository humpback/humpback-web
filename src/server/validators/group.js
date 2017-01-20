exports.validate = (req, res, next) => {
  let group = req.body;
  if (req.method === 'PUT' && !group.ID) {
    return next(new Error("'ID' must not be empty."));
  }
  if (!group.Name) {
    return next(new Error("'Name' must not be empty."));
  }
  if (!group.Servers) {
    return next(new Error("'Servers' must not be empty."));
  }
  if (!group.Owners) {
    return next(new Error("'Owners' must not be empty."));
  }
  next()
}
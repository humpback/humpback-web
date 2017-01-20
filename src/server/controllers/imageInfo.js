const path = require('path');
const uuid = require('uuid');
const Datastore = require('nedb');
const config = require('./../config');

let db = new Datastore({
  filename: path.join(__dirname, `./../db/${config.imageCollection}.db`),
  autoload: true
});

/*
ImageInfo {
  Name: 'xxxxxx',
  Description: 'xxxxxx',
  Dockerfile: 'xxxxxx',
  EditDate: 123313378,
  EditUser: 'admin'
}
*/

exports.get = (req, res, next) => {
  let imageName = req.params.imageName;
  db.findOne({ Name: imageName }, (err, imageInfo) => {
    if (err) return next(err);
    imageInfo = imageInfo || {
      Name: imageName,
      Description: '',
      Dockerfile: '',
      NotFoundInDB: true
    };
    res.send(imageInfo);
  });
}

exports.save = (req, res, next) => {
  let userID = req.session.currentUser.UserID;
  let imageInfo = {
    $set: {
      EditUser: userID,
      EditDate: Date.now()
    }
  };
  if (req.body.Description) {
    imageInfo['$set'].Description = req.body.Description;
  }
  if (req.body.Dockerfile) {
    imageInfo['$set'].Dockerfile = req.body.Dockerfile;
  }
  db.update({ Name: req.body.Name }, imageInfo, { upsert: true }, (err, numReplaced, upsert) => {
    if (err) return next(err);
    res.send({
      result: true
    });
  });
}
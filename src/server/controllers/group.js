const path = require('path');
const uuid = require('uuid');
const Datastore = require('nedb');
const config = require('./../config');

let db = new Datastore({
  filename: path.join(__dirname, `./../db/${config.groupCollection}.db`),
  autoload: true
});

/*
GroupInfo {
  ID: 'admin',
  Name: 'xxxxxx',
  Description: 'xxxxxx',
  OpenToPublic: false,
  Owners: ['admin', 'user1'],
  Servers: ['192.168.0.2'],
  EditDate: 123313378,
  EditUser: 'admin'
}
*/

exports.getByUser = (req, res, next) => {
  let user = req.session.currentUser;
  let queryOption = {};
  if (!user.IsAdmin) {
    queryOption = {
      $or: [
        { "Owners": user.UserID }
      ]
    };
    if (!req.query.formanage) {
      queryOption['$or'].push({ "OpenToPublic": true });
    }
  };
  db.find(queryOption).sort({ Name: 1 }).exec((err, docs) => {
    if (err) return next(err);
    res.json(docs);
  })
}

exports.getByID = (req, res, next) => {
  let groupID = req.params.groupID;
  getById(groupID)
    .then(group => res.json(group))
    .catch(err => next(err));
}

exports.create = (req, res, next) => {
  let userID = req.session.currentUser.UserID;
  let group = req.body;
  isExists(group.Name, '')
    .then((result) => {
      if (result === true) {
        return next(new Error("Group is exists."));
      }
      group.ID = uuid.v4();
      group.InUser = userID;
      group.InDate = Date.now();
      group.EditUser = userID;
      group.EditDate = Date.now();
      db.insert(group, (err, newDoc) => {
        if (err) return next(err);
        res.send({
          result: true
        });
      });
    })
    .catch(err => next(err));
}

exports.update = (req, res, next) => {
  let userID = req.session.currentUser.UserID;
  let group = req.body;
  isExists(group.Name, group.ID)
    .then(result => {
      group.EditUser = userID;
      group.EditDate = Date.now();
      db.update({ ID: group.ID }, group, {}, (err, numReplaced) => {
        if (err) return next(err);
        res.json(group);
      });
    })
    .catch(err => next(err));
}

exports.remove = (req, res, next) => {
  let groupID = req.params.groupID;
  db.remove({ ID: groupID }, {}, (err, numRemoved) => {
    if (err) return next(err);
    res.send({
      result: true
    });
  });
}

let getById = (groupID) => {
  return new Promise((resolve, reject) => {
    db.findOne({ ID: groupID }, (err, doc) => {
      if (err) return reject(err);
      resolve(doc);
    });
  });
}

let isExists = (name, groupID) => {
  return new Promise((resolve, reject) => {
    let regStr = `^${name}$`;
    db.find({
      Name: { $regex: new RegExp(regStr, 'i') },
      ID: { $ne: groupID }
    }, (err, docs) => {
      if (err) return reject(err);
      resolve(docs.length > 0);
    });
  });
}
const uuid = require('uuid');
const dbFactory = require('./../db/dbFactory').factory;
const config = require('./../config');

let db = dbFactory.getCollection(config.dbConfigs.systemConfigCollection.name);

exports.get = (req, res, next) => {
  let userId = '';
  if (req.session.currentUser) {
    userId = (req.session.currentUser.UserID || '').toLowerCase();
  }
  let filesOpt = {};
  if (config.superAdmins.indexOf(userId) === -1) {
    filesOpt.Admins = 0;
  }
  db.findOne({ ID: 1 }, filesOpt, (err, doc) => {
    if (err) return next(err);
    res.json(doc || {});
  });
}

exports.save = (req, res, next) => {
  let clientConfig = req.body;
  clientConfig.ID = 1;
  db.update({ ID: 1 }, clientConfig, { upsert: true }, (err, numReplaced, upsert) => {
    if (err) return next(err);
    res.send({
      result: true
    });
  });
}

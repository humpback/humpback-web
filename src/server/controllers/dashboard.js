const config = require('./../config');
const dbFactory = require('./../db/dbFactory').factory;

let db = dbFactory.getCollection(config.dbConfigs.dashboardCollection.name);

exports.get = (req, res, next) => {
  db.findOne({ ID: 1 }, (err, doc) => {
    if (err) return next(err);
    res.json(doc);
  });
}

exports.save = (req, res, next) => {
  let dashboard = req.body;
  dashboard.ID = 1;
  db.update({ ID: 1 }, dashboard, { upsert: true }, (err, num) => {
    if (err) return next(err);
    res.json({ result: true });
  });
}

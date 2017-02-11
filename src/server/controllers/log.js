const uuid = require('uuid');
const dbFactory = require('./../db/dbFactory').factory;
const config = require('./../config');

let db = dbFactory.getCollection(config.dbConfigs.logCollection.name);
/*
LogInfo {
  LogId:'xxxxxx',
  GroupId: 'xxxxxx',
  Server: 'xxxxxx',
  Type: 'xxxxxx',
  Content: 'xxxxxx',
  UserId: 'xxxxxx',
  FullName: 'admin',
  InDate: 12313333
}
*/

exports.add = (req, res, next) => {
  let log = {
    LogId: uuid.v4(),
    Group: req.body.Group,
    Server: req.body.Server,
    Type: req.body.Type,
    Content: req.body.Content,
    UserId: req.session.currentUser.UserID,
    FullName: req.session.currentUser.FullName,    
    InDate: new Date().valueOf()
  };
  db.insert(log, (err, newDoc) => {
    if (err) return next(err);
    res.json({
      result: true
    });
  });
}

exports.get = (req, res, next) => {
  let pageSize = +(req.query.pageSize || 10);
  let pageIndex = +(req.query.pageIndex || 1);
  let sortField = "InDate";
  let queryOption = {};
  if (req.query.Group) {
    queryOption.Group = req.query.Group;
  }
  if (req.query.Server) {
    queryOption.Server = req.query.Server;
  }
  if (req.query.Type) {
    queryOption.Type = req.query.Type;
  }

  let skiped = pageSize * (pageIndex - 1);
  db.find(queryOption).sort({ InDate: -1 }).skip(skiped).limit(pageSize).exec((err, docs) => {
    if (err) return next(err);
    db.count(queryOption, (err, count) => {
      if (err) return next(err);
      let data = {
        pageIndex: pageIndex,
        pageSize: pageSize,
        rows: docs,
        total_rows: count
      };
      res.json(data);
    });
  });
}
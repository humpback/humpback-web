const path = require('path');
const Datastore = require('nedb');
const config = require('./../config');

class DBFactory {
  constructor() {
    this.dbs = {};
    this.connectDB();
  }

  getCollection(collectionName) {
    if (!this.dbs) {
      this.connectDB();
    }
    let col = this.dbs[collectionName];
    return col;
  }

  connectDB() {
    for (let key in config.dbConfigs) {
      let item = config.dbConfigs[key];
      if (item.ignoreLoad) continue;
      let option = {
        filename: path.join(__dirname, `./../dbFiles/${item.name}.db`),
        autoload: true
      };
      if (item.ttl) {
        option.timestampData = true;
      }
      let db = new Datastore(option);
      if (item.ttl) {
        db.ensureIndex({ fieldName: 'createdAt', expireAfterSeconds: item.ttl }, function (err) {
          if (err) console.log(err);
        });
      }
      this.dbs[item.name] = db;
    }
  }
}

exports.factory = new DBFactory();
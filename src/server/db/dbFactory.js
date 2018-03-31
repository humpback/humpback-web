const path = require('path');
const fs = require('fs');
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
    let dbFilesPath = path.join(__dirname, `./../dbFiles`);
    if (!fs.existsSync(dbFilesPath)) {
      fs.mkdirSync(dbFilesPath);
    }
    for (let key in config.dbConfigs) {
      let item = config.dbConfigs[key];
      if (item.ignoreLoad) continue;
      let option = {
        filename: path.join(dbFilesPath, `${item.name}.db`),
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
      db.persistence.setAutocompactionInterval(1 * 60 * 60 * 1000);
      this.dbs[item.name] = db;
    }
  }
}

exports.factory = new DBFactory();

const express = require('express');
const logsCtrl = require('./../controllers/log');
const logValidator = require('./../validators/log');

let router = express.Router();

router.get('/',
  logsCtrl.get
);

router.post('/',
  logValidator.validate,
  logsCtrl.add
);

module.exports = router;
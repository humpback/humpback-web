const express = require('express');
const dashboardCtrl = require('./../controllers/dashboard');

let router = express.Router();

router.get('/',
  dashboardCtrl.get
);

router.post('/',
  dashboardCtrl.save
);

module.exports = router;

const express = require('express');
const systemConfigCtrl = require('./../controllers/systemConfig');
const userValidator = require('./../validators/user');

let router = express.Router();

router.get('/',
  systemConfigCtrl.get
);


router.put('/',
  userValidator.isAdmin,
  systemConfigCtrl.save
)

module.exports = router;
const express = require('express');
const imageInfoCtrl = require('./../controllers/imageInfo');
const imageInfoValidator = require('./../validators/imageInfo');

let router = express.Router();

router.get('/:imageName',
  imageInfoCtrl.get
);

router.post('/',
  imageInfoValidator.validate,
  imageInfoCtrl.save
);

module.exports = router;
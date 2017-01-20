const express = require('express');
const groupCtrl = require('./../controllers/group');
const groupValidator = require('./../validators/group');

let router = express.Router();

router.get('/',
  groupCtrl.getByUser
);

router.get('/:groupID',
  groupCtrl.getByID
);

router.post('/',
  groupValidator.validate,
  groupCtrl.create
);

router.put('/',
  groupValidator.validate,
  groupCtrl.update
);

router.delete('/:groupID',
  groupCtrl.remove
);

module.exports = router;
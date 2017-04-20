const express = require('express');
const groupCtrl = require('./../controllers/group');
const groupValidator = require('./../validators/group');

let router = express.Router();

router.get('/',
  groupCtrl.getByUser
);

router.get('/getallservers',
  groupValidator.validateGetAllServers,
  groupCtrl.getAllServers
);

router.get('/getclusters',
  groupValidator.validateGetCluster,
  groupCtrl.getClusters
);

router.get('/getbasicgroupsinfo',
  groupCtrl.getBasicGroupsInfo
)

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

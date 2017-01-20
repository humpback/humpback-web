const express = require('express');
const userCtrl = require('./../controllers/user');
const userValidator = require('./../validators/user');

let router = express.Router();

router.get('/',
  userValidator.isAdmin,
  userCtrl.getAll
);

router.get('/current-user',
  userCtrl.getCurrentUser
)

router.get('/avatar/:userId',
  userCtrl.getAvatar
);

router.get('/isLogin',
  userCtrl.isLogin
);

router.post('/login',
  userValidator.validateLogin,
  userCtrl.login
);

router.get('/logout',
  userCtrl.logout
);

router.get('/search',
  userCtrl.search
);

router.get('/:userId',
  userCtrl.getById
)

router.post('/register',
  userValidator.validateRegister,
  userCtrl.register
);

router.put('/reset-password',
  userValidator.isAdmin,
  userValidator.validateResetPassword,
  userCtrl.resetPassword
);

router.put('/change-password',
  userValidator.validateChangePassword,
  userCtrl.changePassword
);

router.put('/:userId',
  userValidator.validateUpdate,
  userCtrl.update
);

router.delete('/:userId',
  userValidator.isAdmin,
  userCtrl.remove
);

module.exports = router;
const express = require('express');
const router = express.Router();
const StudentAuth = require('../controllers/studentAuth');
const protect = require('../middleware/auth');

router.post('/student-signup', StudentAuth.signup);
router.post('/student-login', StudentAuth.login);


module.exports = router;

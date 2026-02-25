const express = require('express');
const router = express.Router();

const {signup, signin, logout, forgotPassword, resetPassword} = require('../controllers/authController');

router.post('/signup', signup);
router.post('/login', signin);
router.get('/logout', logout);

router.post('/forgotPassword', forgotPassword);
router.post('/resetPassword/:token', resetPassword);

module.exports = router;
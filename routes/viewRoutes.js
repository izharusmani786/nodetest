const express = require('express');
const router = express.Router();
const { overview, getProducts, getProduct, loginForm, signupForm, forgotPasswordForm, logout, getUser } = require('../controllers/viewController');
const { isLoggedIn } = require('../controllers/authController');

router.use(isLoggedIn);
// Routes
router.get('/', overview);
router.get('/products', getProducts);
router.get('/product/:slug', getProduct);
router.get('/user/:id', getUser);
router.get('/login', loginForm);
router.get('/signup', signupForm);
router.get('/forgotPassword', forgotPasswordForm);
router.get('/logout', logout);

module.exports = router;
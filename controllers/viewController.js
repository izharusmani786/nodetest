const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.overview = catchAsync(async (req, res) => {
    const products = await Product.find().populate('category');
    console.log(products);
    res.status(200).render('home', {
        title: 'Home',
        products,
        pageType: 'overview'
    });
})
exports.getProducts = catchAsync(async (req, res, next) => {
    const products = await Product.find().populate('category');
    console.log(products);
    res.status(200).render('products', {
        title: 'All Products',
        products,
        pageType: 'overview'
    });
})

exports.getProduct = catchAsync(async (req, res, next) => {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category');
    
    if (!product) {
        return next(new AppError('No product found with that slug', 404));
    }
    console.log(product);
    res.status(200).render('single-product', {
        title: 'Product Details',
        product,
        pageType: 'product-detail'
    });
})

exports.getUser = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }
    res.status(200).render('user-profile', {
        title: 'User Profile',
        user,
        pageType: 'user-profile'
    });
})
exports.loginForm = catchAsync (async (req, res, next) => {
    res.status(200).render('login', {
        title: 'Login',
        pageType: 'login'
    });
})

exports.signupForm = catchAsync (async (req, res, next) => {
    res.status(200).render('signup', {
        title: 'Sign Up',
        pageType: 'signup'
    });
})

exports.forgotPasswordForm = catchAsync (async (req, res, next) => {
    res.status(200).render('forgotPassword', {
        title: 'Forgot Password',
        pageType: 'forgotPassword'
    });
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true  
    });

    res.redirect('/');
};
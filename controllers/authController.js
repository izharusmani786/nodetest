const crypto = require('crypto');
const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');

const signToken = id => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

exports.signup = catchAsync(async (req, res) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        message: 'User signed up successfully',
        data: {
            user: newUser
        }
    });
})

exports.signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // 1) check if email and password exist
    if( !email || !password ) {
        return next(new AppError('email and password does not exists', 404));
    }

    // 2) check if user exists and password is correct
    const user = await User.findOne({email: email}).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))) {
        return next(new AppError('Incorrect email or password', 401));
    }

    //3) if all ok, send token to client
    const token = signToken(user._id);

    res.cookie('jwt', token, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    });
    res.status(200).json({
        status: 'success',
        message: 'User logged in successfully',
        token
    });
})

exports.protect = catchAsync(async function(req, res, next) {
    // 1) check if token exists
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if(req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    if(!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }
    
    // 2) verify token
    const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    if(!decode) {
        return next(new AppError('Invalid token. Please log in again!', 401));
    }

    // 3) check if user still exists
    const currentUser = await User.findById(decode.id);
    if(!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // 4) check if user changed password after the token was issued
    if(currentUser.changedPasswordAfter(decode.iat)) {
        return next(new AppError('User recently changed password! Please log in again.', 401));
    }

    req.user = currentUser;
    next();
});

exports.isLoggedIn = catchAsync(async function(req, res, next) {
    // 1) check if token exists
    if(req.cookies.jwt) {
        try{            
            const decode = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

            // 3) check if user still exists
            const currentUser = await User.findById(decode.id);
            if(!currentUser) {
                return next();
            }

            // 4) check if user changed password after the token was issued
            if(currentUser.changedPasswordAfter(decode.iat)) {
                return next();
            }

            res.locals.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    const user = await User.findOne({email: req.body.email});
    if(!user) {
        return next(new AppError('There is no user with email address.', 404));
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/resetPassword/${resetToken}`;

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 min)',
            message
        });
    } catch (err) {
        console.log(err);
        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }

    res.status(200).json({
        status: 'success',
        message: 'Token sent to email!'
    });
})

exports.resetPassword = catchAsync(async (req, res, next) => {

    const hashedToken = crypto.createHash('sah256').update(req.params.token).digest('hex');

    const user = await User.findOne({resetPasswordToken: hashedToken, resetPasswordExpires: {$gt: Date.now()}});

    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password;
    user.confirmPassword = req.body.confirmPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        message: 'User logged in successfully',
        token
    });
})

exports.logout = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'User logged out successfully'
    });
}
const AppError = require('./../utils/appError');

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
}

const devError = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: err.message
        });
    }
}

const prodError = (err, req, res) => {
    if(req.originalUrl.startsWith('/api')) {
        if(err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            });
        } else {
            res.status(err.statusCode).json({
                status: err.status,
                message: 'Something went wrong!'
            });
        }
    } else {
        res.status(err.statusCode).render('error', {
            title: 'Something went wrong!',
            message: err.message
        });
    }
}

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if(process.env.NODE_ENV === 'development') {
        devError(err, req, res);
    } else if(process.env.NODE_ENV === 'production') {
        let error = {...err}
        if(error.name === 'CastError') error = handleCastErrorDB(error);
        prodError(error, req, res);
    }
}
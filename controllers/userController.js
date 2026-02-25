const User = require('../models/userModel');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.params.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/users/${req.file.filename}`);

    next();
}

exports.getAllUsers = async (req, res) => {
    try{
        const users = await User.find()

        res.status(200).json({
            status: 'success',
            message: 'Get all users',
            data: {
                users
            }
        });
    } catch (err) {
        console.error('Error fetching users', err);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching users'
        });
    }
}

exports.createUser = async (req, res) => {
    try{
        if(req.file) {
            req.body.photo = req.file.filename;
        }

        const newUser = await User.create(req.body);

        res.status(201).json({
            status: 'success',
            message: 'User created successfully',
            data: {
                user: newUser
            }
        });
    } catch (err) {
        console.error('Error creating user', err);
        res.status(500).json({
            status: 'error',
            message: 'Invalid data sent'
        });
    }
}

exports.getUser = async (req, res) => {
    try{
        const user = await User.findById(req.params.id)
        res.status(200).json({
            status: 'success',
            message: `Get user with ID ${req.params.id}`,
            data: {
                user
            }
        })
    } catch(err) {
        console.error('Error fetching user', err);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching user',
            error: err.message
        });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                returnDocument: 'after',
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'User not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: { user }
        });

    } catch (err) {
        res.status(400).json({
        status: 'error',
        message: err.message
        });
    }
};

exports.deleteUser = async (req, res) => {
    try{
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }
        res.status(204).json({
            status: 'success',
            message: `Delete user with ID ${req.params.id}`
        });
    } catch(err) {
        console.error('Error deleting user', err);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting user'
        });
    }
}
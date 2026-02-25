const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../controllers/authController');
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    uploadUserPhoto,
    resizeUserPhoto
} = require('../controllers/userController');

router.route('/')
    .get(protect, getAllUsers)
    .post(protect, uploadUserPhoto, resizeUserPhoto, createUser);

router.route('/:id')
    .get(protect, getUser)
    .patch(protect, uploadUserPhoto, updateUser)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteUser);

module.exports = router;
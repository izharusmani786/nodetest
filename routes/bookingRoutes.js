const express = require('express');
const router = express.Router();
const { protect, isLoggedIn, restrictTo } = require('../controllers/authController');
const { overview } = require('../controllers/viewController');
const {
    getAllBookings,
    createBooking,
    getBooking,
    updateBooking,
    deleteBooking,
    getCheckoutSession
} = require('../controllers/bookingController');

router.get('/checkout-session/:productId', protect, getCheckoutSession);

router.get('/', createBooking, isLoggedIn, overview);

router.route('/')
    .get(protect, getAllBookings)
    .post(protect, createBooking);

router.route('/:id')
    .get(protect, getBooking)
    .patch(protect, updateBooking)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteBooking);

module.exports = router;
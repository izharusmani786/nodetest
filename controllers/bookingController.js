const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/bookingModel');
const Product = require('../models/productModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');


exports.getCheckoutSession = catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.productId);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/products?product=${req.params.productId}&user=${req.user.id}&price=${product.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/product/${product.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.productId,
        mode: 'payment',
        line_items: [
            {
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: product.name,
                        description: product.summary,
                        images: [product.imageCover]
                    },
                    unit_amount: product.price * 100, // IMPORTANT: Stripe expects paisa (₹100 = 10000)
                },
                quantity: 1
            }
        ],
    })
    res.status(200).json({
        status: 'success',
        session
    });
})

exports.getAllBookings = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Get all bookings'
    });
}

exports.createBooking = catchAsync(async (req, res, next) => {
    const { product, user, price } = req.body;
    if (!product || !user || !price)  return next();

    await Booking.create({ product, user, price });
    res.redirect(req.originalUrl.split('?')[0]);
})

exports.getBooking = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: `Get booking with ID ${req.params.id}`
    });
}

exports.updateBooking = (req, res) => {
    res.status(200).json({
        status: 'success',
        message: `Update booking with ID ${req.params.id}`
    });
}

exports.deleteBooking = (req, res) => {
    res.status(204).json({
        status: 'success',
        message: `Delete booking with ID ${req.params.id}`,
        data: null
    });
}
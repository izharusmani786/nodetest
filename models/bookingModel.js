const mongoose = require('mongoose');

// Schema
const bookingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: false
    }
})

bookingSchema.pre(/^find/, function(next) {
    this.populate('user').populate({
        path: 'product',
        select: 'name email'
    });
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
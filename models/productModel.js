const mongoose = require('mongoose');
const slugify = require('slugify');
// Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    slug: {
        type: String
    },
    price: {
        type: Number,
        required: [true, 'Price is required']
    },
    description: {
        type: String
    },
    summary: {
        type: String,
        required: [true, 'Summary is required']
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Category is required']    
    }, 
    imageCover: {
        type: String
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    updatedAt: {
        type: Date,
        default: Date.now()
    }
}, { timestamps: true })

productSchema.pre('save', async function(next) {
    this.slug = await slugify(this.name, {
        lower: true,
        strict: true
    });
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
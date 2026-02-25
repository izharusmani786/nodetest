const Product = require('../models/productModel');
const Category = require("../models/categoryModel");
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/products');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `product-${Date.now()}.${ext}`);
//     }
// });

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

exports.uploadProductImages = upload.fields([
    { name: 'imageCover', maxCount: 1 },
    { name: 'images', maxCount: 5 }
])

exports.resizeProductImage = catchAsync(async (req, res, next) => {
    if(!req.files.imageCover || !req.files.images) return next();

    req.body.imageCover = `product-${req.body.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/products/${req.body.imageCover}`);
    
    req.body.images = [];
    await Promise.all(
        req.files.images.map(async (file, i) => {
            const filename = `product-${req.body.id}-${Date.now()}-${i+1}.jpeg`;
            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/products/${filename}`);

            req.body.images.push(filename);
        })
    ); 

    next();
})

exports.getAllProducts = catchAsync(async (req, res) => {

    const queryObject = {...req.query};

    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach(el => delete queryObject[el]);

    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    const queryObjectParsed = JSON.parse(queryStr);

    const query = Product.find(queryObjectParsed)
                        .populate('category');
    const products = await query;

    res.status(200).json({
        status: 'success',
        message: 'Get all products',
        count: products.length,
        data: {
            products
        }
    });

})

exports.createProduct = catchAsync(async (req, res) => {

    const category = await Category.findById(req.body.category);
    if(!category) {
        return res.status(400).json({
            status: 'fail',
            message: 'Invalid category ID'
        });
    }

    const newProduct = await Product.create(req.body);
    res.status(201).json({
        status: 'success',
        message: 'Product created successfully',
        data: {
            product: newProduct
        }
    });
    
})

exports.getProduct = catchAsync(async (req, res) => {

    const product = await Product.findById(req.params.id).populate("category");
    res.status(200).json({
        status: 'success',
        message: `Get product with ID ${req.params.id}`,
        data: {
            product
        }
    });
    
})

exports.updateProduct = catchAsync(async (req, res) => {

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })
    res.status(200).json({
        status: 'success',
        message: `Update product with ID ${req.params.id}`,
        data: {
            product
        }
    }); 
})

exports.deleteProduct = catchAsync(async (req, res) => {

    await Product.findByIdAndDelete(req.params.id)
    res.status(204).json({
        status: 'success',
        message: `Delete product with ID ${req.params.id}`,
        data: null 
    });

})

exports.getProductsByCategory = catchAsync(async (req, res) => {

    const products = await Product.find({
        category: req.params.id
    }).populate("category");

    res.status(200).json({
        status: 'success',
        message: `Get products by category with ID ${req.params.id}`,
        count: products.length,
        data: {
            products
        }
    });
})
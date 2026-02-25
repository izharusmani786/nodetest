const express  = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../controllers/authController');

const {
    getAllProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getProductsByCategory,
    uploadProductImages,
    resizeProductImage
} = require('../controllers/productController');

router.route('/')
    .get(protect, getAllProducts)
    .post(protect, uploadProductImages, resizeProductImage, createProduct);

router.route('/:id')
    .get(protect, getProduct)
    .patch(protect, uploadProductImages, resizeProductImage, updateProduct)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteProduct);

router.route('/category/:id')
    .get(protect, getProductsByCategory);

module.exports = router;
const exporess = require('express');
const router = exporess.Router();
const { protect, restrictTo } = require('../controllers/authController');
const {
    getAllCategories,
    createCategory,
    getCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

router.route('/')
    .get(protect, getAllCategories)
    .post(protect, createCategory);

router.route('/:id')
    .get(protect, getCategory)
    .patch(protect, updateCategory)
    .delete(protect, restrictTo('admin', 'lead-guide'), deleteCategory);

module.exports = router;
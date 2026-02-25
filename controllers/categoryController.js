const Category = require('../models/categoryModel');

exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            status: 'success',
            message: 'Get all categories',
            data: {
                categories
            }
        });
    } catch (err) {
        console.error('Error fetching categories', err);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching categories'
        });
    }
}

exports.createCategory = async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.status(201).json({
            status: 'success',
            message: 'Create a category',
            data: {
                category: newCategory
            }
        });
    } catch (err) {
        console.error('Error creating category', err);
        res.status(500).json({
            status: 'error',
            message: 'Error creating category'
        });
    }
}

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        res.status(200).json({
            status: 'success',
            message: `Get category with ID ${req.params.id}`,
            data: {
                category
            }
        });
    } catch (err) {
        console.error('Error fetching category', err);
        res.status(500).json({
            status: 'error',
            message: 'Error fetching category'
        });
    }
}

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { 
            new: true, 
            runValidators: true 
        })
        res.status(200).json({
            status: 'success',
            message: `Update category with ID ${req.params.id}`,
            data: {
                category
            }
        });
    } catch (err) {
        console.error('Error updating category', err);
        res.status(500).json({
            status: 'error',
            message: 'Error updating category'
        });
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            message: `Delete category with ID ${req.params.id}`
        });
    } catch (err) {
        console.error('Error deleting category', err);
        res.status(500).json({
            status: 'error',
            message: 'Error deleting category'
        });
    }
}
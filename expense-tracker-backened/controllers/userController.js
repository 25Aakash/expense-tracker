// controllers/userController.js
//------------------------------------------------------------
//  Category management for expenses & incomes
//------------------------------------------------------------
const User = require('../models/User');
const Joi  = require('joi');

// Joi schema for a category payload
const categorySchema = Joi.object({
  category: Joi.string().trim().min(1).required(),
});

//─────────────────────────────────────────────────────────────
//  Expense categories
//─────────────────────────────────────────────────────────────
exports.getExpenseCategories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, 'categories.expense');
    const categories = user?.categories?.expense || [];
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

exports.addExpenseCategory = async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { category } = req.body;

    // $addToSet avoids duplicates and skips full-document validation
    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { 'categories.expense': category } }
    );

    const updated = await User.findById(req.user.id, 'categories.expense');
    res.json({ categories: updated.categories.expense });
  } catch (err) {
    next(err);
  }
};

//─────────────────────────────────────────────────────────────
//  Income categories
//─────────────────────────────────────────────────────────────
exports.getIncomeCategories = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id, 'categories.income');
    const categories = user?.categories?.income || [];
    res.json({ categories });
  } catch (err) {
    next(err);
  }
};

exports.addIncomeCategory = async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { category } = req.body;

    await User.updateOne(
      { _id: req.user.id },
      { $addToSet: { 'categories.income': category } }
    );

    const updated = await User.findById(req.user.id, 'categories.income');
    res.json({ categories: updated.categories.income });
  } catch (err) {
    next(err);
  }
};

exports.deleteExpenseCategory = async (req, res, next) => {
  console.log('DELETE req.body:', req.body);
  // ...existing code...
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { 'categories.expense': category } }
    );
    const updated = await User.findById(req.user.id, 'categories.expense');
    res.json({ categories: updated.categories.expense });
  } catch (err) {
    next(err);
  }
};

exports.deleteIncomeCategory = async (req, res, next) => {
  // ...existing code...
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    await User.updateOne(
      { _id: req.user.id },
      { $pull: { 'categories.income': category } }
    );
    const updated = await User.findById(req.user.id, 'categories.income');
    res.json({ categories: updated.categories.income });
  } catch (err) {
    next(err);
  }
};

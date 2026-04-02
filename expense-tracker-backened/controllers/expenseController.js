const Expense = require('../models/Expense');

exports.addExpense = async (req, res, next) => {
  try {
    const { amount, category, note, date, method } = req.body;
    const expense = new Expense({ amount, category, note, date, method, userId: req.user.id });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
};

exports.getExpenses = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page  || '1');
    const limit = parseInt(req.query.limit || '0'); // 0 = no limit (return all)

    let query = Expense.find({ userId: req.user.id }).sort({ date: -1 });

    if (limit > 0) {
      query = query.skip((page - 1) * limit).limit(limit);
    }

    const expenses = await query;
    res.json(expenses);
  } catch (err) {
    next(err);
  }
};

exports.updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, category, note, date, method } = req.body;
    const updates = {};
    if (amount !== undefined) updates.amount = parseFloat(amount);
    if (category !== undefined) updates.category = category;
    if (note !== undefined) updates.note = note;
    if (date !== undefined) updates.date = date;
    if (method !== undefined) updates.method = method;

    const updated = await Expense.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Expense not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    next(err);
  }
};

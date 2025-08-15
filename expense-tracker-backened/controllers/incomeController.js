const Income = require('../models/Income');

exports.addIncome = async (req, res, next) => {
  try {
    const income = new Income({ ...req.body, userId: req.user.id });
    await income.save();
    res.status(201).json(income);
  } catch (err) {
    next(err);
  }
};

exports.getIncomes = async (req, res, next) => {
  try {
    const page  = parseInt(req.query.page  || '1');
    const limit = parseInt(req.query.limit || '20');

    const incomes = await Income.find({ userId: req.user.id })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json(incomes);
  } catch (err) {
    next(err);
  }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (req.body.amount) req.body.amount = parseFloat(req.body.amount);

    const updated = await Income.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Income not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    const deleted = await Income.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!deleted) return res.status(404).json({ error: 'Income not found' });
    res.json({ message: 'Income deleted' });
  } catch (err) {
    next(err);
  }
};

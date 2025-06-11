const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const adminRoutes = require('./routes/adminRoutes'); // ✅ Make sure this comes after app is defined
const profileRoutes = require('./routes/profileRoutes');
const PORT = process.env.PORT || 5000;

const app = express(); // ✅ Moved above app.use

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/admin', adminRoutes); // ✅ Now it's safe to use
app.use('/api/profile', profileRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected");
  app.listen(5000, () => console.log("Server started on port 5000"));
}).catch(err => console.error(err));

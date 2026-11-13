const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const User = require("./models/user");
const Expense = require("./models/expense");

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed Categories
const ALLOWED_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Medical",
  "Education",
  "Entertainment",
  "Bills",
  "Other"
];

// Middleware
app.use(cors());
app.use(express.json());

// Connect MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/ExpenseDB')
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Helper: Helper function to validate expense fields
const validateExpense = ({ title, category, amount, date }) => {
  const errors = {};

  if (!title || !title.trim()) {
    errors.title = "Title cannot be blank.";
  }

  if (!category || !ALLOWED_CATEGORIES.includes(category)) {
    errors.category = `Category must be one of: ${ALLOWED_CATEGORIES.join(", ")}.`;
  }

  const numAmount = Number(amount);
  if (amount === undefined || amount === null || amount === "" || isNaN(numAmount)) {
    errors.amount = "Amount cannot be blank.";
  } else if (numAmount <= 0) {
    errors.amount = "Amount must be greater than 0.";
  }

  if (!date || !date.trim()) {
    errors.date = "Date cannot be blank.";
  } else {
    const inputDate = new Date(date);
    const today = new Date();
    // set time to midnight for accurate comparison
    today.setHours(23, 59, 59, 999);
    if (inputDate > today) {
      errors.date = "Future dates are not allowed.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// ==================== AUTH ROUTES ====================

const handleSignup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Name is required." });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address." });
    }

    if (!password || password.length < 3) {
      return res.status(400).json({ message: "Password must be at least 3 characters long." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      budget: 0
    });
    await newUser.save();

    res.status(201).json({
      message: "Registration successful!",
      user: { id: newUser._id, name: newUser.name, email: newUser.email, budget: newUser.budget }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim(), password });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.json({
      message: "Login successful!",
      user: { id: user._id, name: user.name, email: user.email, budget: user.budget ?? 0 }
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

const handleLogout = (req, res) => {
  res.json({ message: "Logged out successfully." });
};

// Map routes for auth
app.post("/signup", handleSignup);
app.post("/api/auth/signup", handleSignup);

app.post("/login", handleLogin);
app.post("/api/auth/login", handleLogin);

app.post("/logout", handleLogout);
app.post("/api/auth/logout", handleLogout);

// Update Budget Endpoint
app.put("/api/user/budget", async (req, res) => {
  try {
    const { userId, budget } = req.body;

    const numBudget = Number(budget);
    if (budget === undefined || budget === null || budget === "" || isNaN(numBudget)) {
      return res.status(400).json({ message: "Budget cannot be empty." });
    }
    if (numBudget <= 0) {
      return res.status(400).json({ message: "Budget must be greater than 0." });
    }

    if (userId) {
      const user = await User.findByIdAndUpdate(userId, { budget: numBudget }, { new: true });
      if (user) {
        return res.json({ message: "Budget updated successfully", budget: user.budget });
      }
    }

    res.json({ message: "Budget updated successfully", budget: numBudget });
  } catch (error) {
    res.status(500).json({ message: "Failed to update budget", error: error.message });
  }
});

// ==================== EXPENSE ROUTES ====================

// GET /expenses - Fetch expenses (sorted latest first, optional category filter)
const handleGetExpenses = async (req, res) => {
  try {
    const { category, userId } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (userId) filter.userId = userId;

    const expenses = await Expense.find(filter).sort({ date: -1, createdAt: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
};

// GET /expenses/:id
const handleGetExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expense details", error: error.message });
  }
};

// POST /expenses
const handleCreateExpense = async (req, res) => {
  try {
    const { title, category, amount, date, userId } = req.body;

    const { isValid, errors } = validateExpense({ title, category, amount, date });
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const newExpense = new Expense({
      title: title.trim(),
      category,
      amount: Number(amount),
      date,
      userId: userId || null
    });

    await newExpense.save();
    res.status(201).json({ message: "Expense added successfully!", expense: newExpense });
  } catch (error) {
    res.status(500).json({ message: "Failed to add expense", error: error.message });
  }
};

// PUT /expenses/:id
const handleUpdateExpense = async (req, res) => {
  try {
    const { title, category, amount, date } = req.body;

    const { isValid, errors } = validateExpense({ title, category, amount, date });
    if (!isValid) {
      return res.status(400).json({ message: "Validation failed", errors });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        category,
        amount: Number(amount),
        date
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.json({ message: "Expense updated successfully!", expense: updatedExpense });
  } catch (error) {
    res.status(500).json({ message: "Failed to update expense", error: error.message });
  }
};

// DELETE /expenses/:id
const handleDeleteExpense = async (req, res) => {
  try {
    const deletedExpense = await Expense.findByIdAndDelete(req.params.id);
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.json({ message: "Expense deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
};

// Map routes for expenses (both root and /api prefixed for maximum compatibility)
app.get("/expenses", handleGetExpenses);
app.get("/api/expenses", handleGetExpenses);

app.get("/expenses/:id", handleGetExpenseById);
app.get("/api/expenses/:id", handleGetExpenseById);

app.post("/expenses", handleCreateExpense);
app.post("/api/expenses", handleCreateExpense);

app.put("/expenses/:id", handleUpdateExpense);
app.put("/api/expenses/:id", handleUpdateExpense);

app.delete("/expenses/:id", handleDeleteExpense);
app.delete("/api/expenses/:id", handleDeleteExpense);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

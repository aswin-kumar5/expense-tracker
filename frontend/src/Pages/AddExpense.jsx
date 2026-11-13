import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../Components/Header";
import Footer from "../Components/Footer";

const CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Medical",
    "Education",
    "Entertainment",
    "Bills",
    "Other"
];

function AddExpense(){
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("");
    const [amount, setAmount] = useState("");
    const [date, setDate] = useState("");

    const [fieldErrors, setFieldErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [saving, setSaving] = useState(false);

    const [totalSpent, setTotalSpent] = useState(0);
    const [userBudget, setUserBudget] = useState(0);

    const navigate = useNavigate();
    const todayStr = new Date().toISOString().split("T")[0];

    // Fetch budget & existing total on mount
    useEffect(() => {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        const budget = user && user.budget ? Number(user.budget) : 0;
        setUserBudget(budget);

        if (user && user.id) {
            axios.get(`http://localhost:5000/api/expenses?userId=${user.id}`)
                .then((res) => {
                    const total = res.data.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
                    setTotalSpent(total);
                })
                .catch(() => {});
        }
    }, []);

    const validateFrontend = () => {
        const errors = {};

        if (!title.trim()) {
            errors.title = "Title cannot be blank.";
        }

        if (!category) {
            errors.category = "Please select a category.";
        }

        const numAmount = Number(amount);
        if (amount === "" || amount === null || isNaN(numAmount)) {
            errors.amount = "Amount cannot be blank.";
        } else if (numAmount <= 0) {
            errors.amount = "Amount must be greater than 0.";
        } else if (userBudget > 0) {
            const remaining = userBudget - totalSpent;
            if (numAmount > remaining) {
                errors.amount = `Amount exceeds your remaining budget of ₹${remaining.toLocaleString('en-IN')} (Budget: ₹${userBudget.toLocaleString('en-IN')}, Spent: ₹${totalSpent.toLocaleString('en-IN')}).`;
            }
        }

        if (!date) {
            errors.date = "Date cannot be blank.";
        } else if (date > todayStr) {
            errors.date = "Future dates are not allowed.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError("");
        setSuccessMsg("");

        if (!validateFrontend()) {
            return;
        }

        setSaving(true);

        try {
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;

            const response = await axios.post("http://localhost:5000/api/expenses", {
                title: title.trim(),
                category,
                amount: Number(amount),
                date,
                userId: user ? user.id : null
            });

            setSuccessMsg(response.data.message || "Expense added successfully!");
            setTimeout(() => {
                navigate("/viewexpense");
            }, 1200);
        } catch (err) {
            if (err.response?.data?.errors) {
                setFieldErrors(err.response.data.errors);
            } else {
                setServerError(err.response?.data?.message || "Failed to add expense. Please try again.");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <Header/>

            <div className="add-expense-container">
                <div className="add-expense-box">
                    <h2><i className="fa-solid fa-circle-plus" style={{ color: "#2563EB" }}></i> Add Expense</h2>

                    {successMsg && (
                        <div className="alert-success">
                            <i className="fa-solid fa-circle-check"></i> {successMsg}
                        </div>
                    )}
                    {serverError && (
                        <div className="alert-error">
                            <i className="fa-solid fa-circle-exclamation"></i> {serverError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group-custom">
                            <label>Expense Title *</label>
                            <input 
                                type="text" 
                                placeholder="e.g. Weekly Groceries" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            {fieldErrors.title && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.title}</span>
                            )}
                        </div>

                        <div className="form-group-custom">
                            <label>Category *</label>
                            <select 
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <option value="">Select Category</option>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                            {fieldErrors.category && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.category}</span>
                            )}
                        </div>

                        <div className="form-group-custom">
                            <label>Amount (₹) *</label>
                            <input 
                                type="number" 
                                placeholder="Enter amount in ₹" 
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            {fieldErrors.amount && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.amount}</span>
                            )}
                        </div>

                        <div className="form-group-custom">
                            <label>Date *</label>
                            <input 
                                type="date" 
                                value={date}
                                max={todayStr}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            {fieldErrors.date && (
                                <span className="field-error"><i className="fa-solid fa-circle-exclamation"></i> {fieldErrors.date}</span>
                            )}
                        </div>

                        <div style={{ marginTop: "24px" }}>
                            <button 
                                type="submit" 
                                disabled={saving}
                            >
                                {saving ? "Saving Expense..." : "Save Expense"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Footer/>
        </>
    );
}

export default AddExpense;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from "./Pages/Dashboard"
import ViewExpense from "./Pages/ViewExpense"
import AddExpense from "./Pages/AddExpense"
import EditExpense from "./Pages/EditExpense"
import Login from "./Pages/Login"
import Signup from "./Pages/Signup"
import "./App.css"

// Protected Route: redirects to /login if user is not logged in
function PrivateRoute({ children }) {
    const user = localStorage.getItem("user");
    return user ? children : <Navigate to="/login" replace />;
}

// Public Route: redirects to / if user is already logged in
function PublicRoute({ children }) {
    const user = localStorage.getItem("user");
    return !user ? children : <Navigate to="/" replace />;
}

function App(){
    return(
        <>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes (only accessible when NOT logged in) */}
                    <Route path='/login' element={<PublicRoute><Login /></PublicRoute>} />
                    <Route path='/signup' element={<PublicRoute><Signup /></PublicRoute>} />

                    {/* Protected Routes (only accessible when logged in) */}
                    <Route path='/' element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                    <Route path='/viewexpense' element={<PrivateRoute><ViewExpense /></PrivateRoute>} />
                    <Route path='/addexpense' element={<PrivateRoute><AddExpense /></PrivateRoute>} />
                    <Route path='/editexpense' element={<PrivateRoute><EditExpense /></PrivateRoute>} />
                    <Route path='/editexpense/:id' element={<PrivateRoute><EditExpense /></PrivateRoute>} />

                    {/* Catch-all: redirect to login */}
                    <Route path='*' element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
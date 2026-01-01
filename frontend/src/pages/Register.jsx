import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register({ setUser }) {
    const [form, setForm] = useState({ name: "", email: "", address: "", password: "", role: "User" });
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const {name, email, address, password, role} = form;

        try {
            const response = await fetch("http://localhost:4002/api/auth/register", {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/json',
                },
                body: JSON.stringify({ name, email, address, password }),
            });
            const json = await response.json();
            console.log(json);

            if (response.ok) {
                localStorage.setItem('token', json.authtoken);
                navigate("/dashboard")
            } else {
                setError("Registration Failed")
            }
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        }
    }

    return (
        <div 
            className="d-flex justify-content-center align-items-center min-vh-100"
            style={{
                background: "linear-gradient(135deg, #43cea2 0%, #233f5aff 100%)"
            }}
        >
            <div className="card shadow-lg p-4" style={{ width: "450px", borderRadius: "15px" }}>
                <h3 className="text-center mb-4 text-success">Create Account</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form className="row g-3" onSubmit={handleSubmit}>
                    {/* Full Name */}
                    <div className="col-12">
                        <label htmlFor="name" className="form-label">Full Name</label>
                        <input type="text" className="form-control" id="name" value={form.name} name="name" onChange={handleChange} placeholder="Enter your name" />
                    </div>

                    {/* Email */}
                    <div className="col-12">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input type="email" className="form-control" id="email" value={form.email} name="email" onChange={handleChange} placeholder="Enter your email" />
                    </div>

                    {/* Address */}
                    <div className="col-12">
                        <label htmlFor="address" className="form-label">Address</label>
                        <textarea className="form-control" id="address" placeholder="Enter your address" name="address" rows={2} value={form.address} onChange={handleChange}></textarea>
                    </div>

                    {/* Password */}
                    <div className="col-12">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input type="password" className="form-control" id="password" name="password" placeholder="Enter your password" value={form.password} onChange={handleChange} />
                    </div>

                    {/* Submit */}
                    <div className="col-12 text-center">
                        <button type="submit" className="btn btn-success w-100">
                            Register
                        </button>
                    </div>
                </form>

                {/* Links */}
                <p className="text-center mt-3 mb-0">
                    <small>
                        Already have an account?{" "}
                        <Link to="/login" className="text-decoration-none">Login</Link>
                    </small>
                </p>
            </div>
        </div>
    );
}

export default Register;

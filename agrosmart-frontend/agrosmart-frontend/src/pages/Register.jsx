import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");

        // Check password confirmation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        // Basic password validation
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "http://localhost:8080/api/v1/auth/register",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        fullName,
                        email,
                        password,
                    }),
                }
            );

            // Safely read response
            const text = await response.text();

            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = {};
                }
            }

            // Handle backend error
            if (!response.ok) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Registration failed. Please try again."
                );
            }

            /*
             * If backend registration returns an access token,
             * save it so the user is automatically logged in.
             */
            if (data.accessToken) {
                localStorage.setItem("token", data.accessToken);
            }

            /*
             * IMPORTANT:
             * After creating a new account, always go to Home.
             * We intentionally do NOT use location.state?.from here.
             */
            navigate("/", { replace: true });

        } catch (err) {
            setError(
                err.message || "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

            <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">

                {/* Logo / Heading */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-green-700">
                        🌱 Agrosmart AI
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Create your account
                    </p>
                </div>

                {/* Register Form */}
                <form onSubmit={handleRegister}>

                    {/* Full Name */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                    </label>

                    <input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Email */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>

                    <input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Password */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                    </label>

                    <input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Confirm Password */}
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) =>
                            setConfirmPassword(e.target.value)
                        }
                        required
                        className="w-full border border-gray-300 rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-green-500"
                    />

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Register Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold p-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading
                            ? "Creating account..."
                            : "Create Account"}
                    </button>
                </form>

                {/* Login Link */}
                <p className="text-center text-gray-500 mt-6">
                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={() => navigate("/login")}
                        className="text-green-600 font-semibold hover:underline"
                    >
                        Login
                    </button>
                </p>

            </div>
        </div>
    );
}
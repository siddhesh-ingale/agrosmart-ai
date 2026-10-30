import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Login() {

    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    // =========================================
    // LOGIN
    // =========================================

    const handleLogin = async (e) => {

        e.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8080/api/v1/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


            // =========================================
            // READ RESPONSE SAFELY
            // =========================================

            const text = await response.text();

            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = {};
                }
            }


            // =========================================
            // LOGIN FAILED
            // =========================================

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    data.error ||
                    "Invalid email or password"
                );

            }


            // =========================================
            // CHECK TOKEN
            // =========================================

            if (!data.accessToken) {

                throw new Error(
                    "Login successful, but no access token was received."
                );

            }


            // =========================================
            // STORE JWT
            // =========================================

            localStorage.setItem(
                "token",
                data.accessToken
            );


            // =========================================
            // REDIRECT
            // =========================================

            /*
             * If the user was trying to access a protected
             * page before login, return them there.
             *
             * Example:
             *
             * /crop-recommendation
             *        ↓
             * /login
             *        ↓
             * successful login
             *        ↓
             * /crop-recommendation
             */

            const from =
                location.state?.from || "/";


            navigate(
                from,
                {
                    replace: true
                }
            );


        } catch (err) {

            console.error(
                "Login error:",
                err
            );

            setError(
                err.message ||
                "Unable to login. Please try again."
            );

        } finally {

            setLoading(false);

        }
    };


    // =========================================
    // RENDER
    // =========================================

    return (

        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 p-4">

            <div className="w-full max-w-md">

                {/* ================================= */}
                {/* LOGIN CARD */}
                {/* ================================= */}

                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

                    {/* Logo */}

                    <div className="text-center">

                        <div className="w-16 h-16 mx-auto rounded-2xl bg-green-100 flex items-center justify-center text-4xl">
                            🌱
                        </div>

                        <h1 className="text-3xl font-bold text-green-700 mt-4">
                            Agrosmart AI
                        </h1>

                        <p className="text-gray-500 mt-2">
                            Welcome back! Login to continue.
                        </p>

                    </div>


                    {/* ================================= */}
                    {/* FORM */}
                    {/* ================================= */}

                    <form
                        onSubmit={handleLogin}
                        className="mt-8"
                    >

                        {/* Email */}

                        <div className="mb-5">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                                autoComplete="email"
                                className="
                                    w-full
                                    border
                                    border-gray-200
                                    rounded-xl
                                    p-3.5
                                    outline-none
                                    text-gray-700
                                    placeholder-gray-400
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                    transition
                                "
                            />

                        </div>


                        {/* Password */}

                        <div className="mb-5">

                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Password
                            </label>

                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                autoComplete="current-password"
                                className="
                                    w-full
                                    border
                                    border-gray-200
                                    rounded-xl
                                    p-3.5
                                    outline-none
                                    text-gray-700
                                    placeholder-gray-400
                                    focus:border-green-500
                                    focus:ring-2
                                    focus:ring-green-100
                                    transition
                                "
                            />

                        </div>


                        {/* ================================= */}
                        {/* ERROR */}
                        {/* ================================= */}

                        {error && (

                            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100">

                                <p className="text-sm text-red-600">
                                    {error}
                                </p>

                            </div>

                        )}


                        {/* ================================= */}
                        {/* LOGIN BUTTON */}
                        {/* ================================= */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                w-full
                                bg-green-600
                                hover:bg-green-700
                                text-white
                                font-semibold
                                p-3.5
                                rounded-xl
                                transition
                                shadow-sm
                                hover:shadow-md
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >

                            {loading
                                ? "Logging in..."
                                : "Login"
                            }

                        </button>

                    </form>


                    {/* ================================= */}
                    {/* REGISTER */}
                    {/* ================================= */}

                    <div className="text-center mt-6">

                        <p className="text-sm text-gray-500">

                            Don't have an account?{" "}

                            <button
                                type="button"
                                onClick={() =>
                                    navigate("/register")
                                }
                                className="
                                    text-green-600
                                    font-semibold
                                    hover:text-green-700
                                    hover:underline
                                "
                            >
                                Create new account
                            </button>

                        </p>

                    </div>

                </div>


                {/* ================================= */}
                {/* FOOTER */}
                {/* ================================= */}

                <p className="text-center text-xs text-gray-400 mt-5">
                    🌱 Smart farming with Agrosmart AI
                </p>

            </div>

        </div>

    );
}
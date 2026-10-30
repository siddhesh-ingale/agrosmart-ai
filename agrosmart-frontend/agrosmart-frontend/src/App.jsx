import {
    Navigate,
    Route,
    Routes,
    useLocation
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import CropRecommendation from "./pages/CropRecommendation";
import DiseaseDetection from "./pages/DiseaseDetection";
import AIChat from "./pages/AIChat";


// ==========================================
// PROTECTED ROUTE
// ==========================================

function ProtectedRoute({ children }) {

    const location = useLocation();

    const token = localStorage.getItem("token");

    // No token → Login
    if (!token) {

        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location.pathname }}
            />
        );

    }

    // Token exists → allow access
    return children;
}


// ==========================================
// APP
// ==========================================

export default function App() {

    return (

        <Routes>

            {/* ================================= */}
            {/* PUBLIC HOME */}
            {/* ================================= */}

            <Route
                path="/"
                element={<Home />}
            />

            <Route
                path="/home"
                element={<Home />}
            />


            {/* ================================= */}
            {/* AUTH */}
            {/* ================================= */}

            <Route
                path="/login"
                element={<Login />}
            />

            <Route
                path="/register"
                element={<Register />}
            />


            {/* ================================= */}
            {/* PROTECTED TOOLS */}
            {/* ================================= */}

            <Route
                path="/crop-recommendation"
                element={
                    <ProtectedRoute>
                        <CropRecommendation />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/disease-detection"
                element={
                    <ProtectedRoute>
                        <DiseaseDetection />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/ai-chat"
                element={
                    <ProtectedRoute>
                        <AIChat />
                    </ProtectedRoute>
                }
            />


            {/* ================================= */}
            {/* UNKNOWN ROUTE */}
            {/* ================================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/"
                        replace
                    />
                }
            />

        </Routes>

    );
}
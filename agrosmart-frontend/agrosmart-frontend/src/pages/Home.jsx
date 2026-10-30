import { useNavigate } from "react-router-dom";

export default function Home() {

    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">

            {/* ================= HEADER ================= */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                    <div>
                        <p className="text-green-600 font-semibold text-sm">
                            🌱 SMART AGRICULTURE
                        </p>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-1">
                            Welcome to Agrosmart AI
                        </h1>

                        <p className="text-gray-600 mt-2">
                            Your intelligent assistant for smarter farming decisions.
                        </p>
                    </div>

                    <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-green-100">
                        <p className="text-xs text-gray-500">
                            AI Assistant
                        </p>

                        <p className="text-green-700 font-semibold">
                            ● Online
                        </p>
                    </div>

                </div>

            </div>


            {/* ================= HERO ================= */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">

                <div className="bg-gradient-to-r from-green-700 to-emerald-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">

                    <div className="max-w-2xl">

                        <p className="text-green-100 text-sm font-medium">
                            FARMER ASSISTANCE
                        </p>

                        <h2 className="text-2xl md:text-3xl font-bold mt-2">
                            Make better farming decisions with AI 🌾
                        </h2>

                        <p className="text-green-50 mt-3 leading-6">
                            Analyze your farm conditions, identify crop diseases,
                            get suitable crop recommendations and ask Agrosmart AI
                            anything about your farming.
                        </p>

                        <button
                            onClick={() => navigate("/ai-chat")}
                            className="mt-6 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition shadow"
                        >
                            Ask Agrosmart AI →
                        </button>

                    </div>

                </div>

            </div>


            {/* ================= FEATURES ================= */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10">

                <div className="mb-5">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Farming Tools
                    </h2>

                    <p className="text-gray-500 mt-1">
                        Choose a tool to get started.
                    </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


                    {/* CROP RECOMMENDATION */}
                    <button
                        onClick={() => navigate("/crop-recommendation")}
                        className="group bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >

                        <div className="flex items-center justify-between">

                            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-3xl">
                                🌾
                            </div>

                            <span className="text-green-600 opacity-0 group-hover:opacity-100 transition">
                                →
                            </span>

                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mt-5">
                            Crop Recommendation
                        </h3>

                        <p className="text-gray-500 mt-2 leading-6">
                            Find crops suitable for your soil, weather,
                            location and season.
                        </p>

                        <div className="mt-5 text-sm font-semibold text-green-600">
                            Get recommendation →
                        </div>

                    </button>


                    {/* DISEASE DETECTION */}
                    <button
                        onClick={() => navigate("/disease-detection")}
                        className="group bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >

                        <div className="flex items-center justify-between">

                            <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center text-3xl">
                                🔍
                            </div>

                            <span className="text-green-600 opacity-0 group-hover:opacity-100 transition">
                                →
                            </span>

                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mt-5">
                            Disease Detection
                        </h3>

                        <p className="text-gray-500 mt-2 leading-6">
                            Upload a crop image and get AI-powered
                            disease analysis and guidance.
                        </p>

                        <div className="mt-5 text-sm font-semibold text-green-600">
                            Analyze crop →
                        </div>

                    </button>


                    {/* AI CHAT */}
                    <button
                        onClick={() => navigate("/ai-chat")}
                        className="group bg-white rounded-2xl p-6 text-left border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                    >

                        <div className="flex items-center justify-between">

                            <div className="w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center text-3xl">
                                🤖
                            </div>

                            <span className="text-green-600 opacity-0 group-hover:opacity-100 transition">
                                →
                            </span>

                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mt-5">
                            Agrosmart AI
                        </h3>

                        <p className="text-gray-500 mt-2 leading-6">
                            Ask questions about crops, soil, diseases,
                            pests and farming practices.
                        </p>

                        <div className="mt-5 text-sm font-semibold text-green-600">
                            Start conversation →
                        </div>

                    </button>

                </div>

            </div>


            {/* ================= QUICK ACTIONS ================= */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-10 pb-10">

                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

                    <h2 className="text-xl font-bold text-gray-800">
                        🚀 Quick Actions
                    </h2>

                    <p className="text-gray-500 text-sm mt-1">
                        Start with one of the most useful farming actions.
                    </p>


                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-5">

                        <button
                            onClick={() => navigate("/crop-recommendation")}
                            className="border border-green-100 bg-green-50 rounded-xl p-4 text-left hover:bg-green-100 transition"
                        >
                            <p className="font-semibold text-green-800">
                                🌾 Find a Crop
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Get suitable crop suggestions
                            </p>
                        </button>


                        <button
                            onClick={() => navigate("/disease-detection")}
                            className="border border-orange-100 bg-orange-50 rounded-xl p-4 text-left hover:bg-orange-100 transition"
                        >
                            <p className="font-semibold text-orange-800">
                                🔍 Check Disease
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Analyze a crop image
                            </p>
                        </button>


                        <button
                            onClick={() => navigate("/ai-chat")}
                            className="border border-blue-100 bg-blue-50 rounded-xl p-4 text-left hover:bg-blue-100 transition"
                        >
                            <p className="font-semibold text-blue-800">
                                🤖 Ask AI
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                Get farming guidance
                            </p>
                        </button>


                        <button
                            onClick={() => navigate("/profile")}
                            className="border border-purple-100 bg-purple-50 rounded-xl p-4 text-left hover:bg-purple-100 transition"
                        >
                            <p className="font-semibold text-purple-800">
                                👨‍🌾 My Profile
                            </p>

                            <p className="text-xs text-gray-500 mt-1">
                                View your account
                            </p>
                        </button>

                    </div>

                </div>

            </div>

        </div>
    );
}

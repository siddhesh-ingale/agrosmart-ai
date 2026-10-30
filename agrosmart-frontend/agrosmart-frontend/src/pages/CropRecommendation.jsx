import { useState } from "react";
import { useNavigate } from "react-router-dom";

const NUMERIC_FIELDS = [
    "nitrogen",
    "phosphorus",
    "potassium",
    "temperature",
    "humidity",
    "ph",
    "rainfall",
];

export default function CropRecommendation() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nitrogen: "",
        phosphorus: "",
        potassium: "",
        temperature: "",
        humidity: "",
        ph: "",
        rainfall: "",
        soilType: "",
        location: "",
        season: "",
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const validateForm = () => {
        const requiredFields = [
            "nitrogen",
            "phosphorus",
            "potassium",
            "temperature",
            "humidity",
            "ph",
            "rainfall",
            "soilType",
            "location",
            "season",
        ];

        for (const field of requiredFields) {
            if (String(form[field]).trim() === "") {
                return "Please fill in all fields.";
            }
        }

        const numericValues = [
            ["Nitrogen", form.nitrogen],
            ["Phosphorus", form.phosphorus],
            ["Potassium", form.potassium],
            ["Temperature", form.temperature],
            ["Humidity", form.humidity],
            ["pH", form.ph],
            ["Rainfall", form.rainfall],
        ];

        for (const [name, value] of numericValues) {
            if (!Number.isFinite(Number(value))) {
                return `${name} must be a valid number.`;
            }
        }

        const humidity = Number(form.humidity);
        const ph = Number(form.ph);

        if (humidity < 0 || humidity > 100) {
            return "Humidity must be between 0 and 100%.";
        }

        if (ph < 0 || ph > 14) {
            return "Soil pH must be between 0 and 14.";
        }

        if (Number(form.nitrogen) < 0) {
            return "Nitrogen cannot be negative.";
        }

        if (Number(form.phosphorus) < 0) {
            return "Phosphorus cannot be negative.";
        }

        if (Number(form.potassium) < 0) {
            return "Potassium cannot be negative.";
        }

        if (Number(form.rainfall) < 0) {
            return "Rainfall cannot be negative.";
        }

        return "";
    };

    const getRecommendation = async (e) => {
        e.preventDefault();

        setError("");
        setResult(null);

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    from: "/crop-recommendation",
                },
            });

            return;
        }

        setLoading(true);

        try {
            const requestBody = Object.fromEntries(
                Object.entries(form).map(([key, value]) => [
                    key,
                    NUMERIC_FIELDS.includes(key)
                        ? Number(value)
                        : value.trim(),
                ])
            );

            const response = await fetch(
                "http://localhost:8080/api/v1/crops/recommend",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            const text = await response.text();

            let data = {};

            if (text) {
                try {
                    data = JSON.parse(text);
                } catch {
                    data = {};
                }
            }

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");

                navigate("/login", {
                    replace: true,
                    state: {
                        from: "/crop-recommendation",
                    },
                });

                return;
            }

            if (!response.ok) {
                throw new Error(
                    data.message ||
                        data.error ||
                        "Failed to get crop recommendation."
                );
            }

            if (
                !data ||
                !Array.isArray(data.recommendations)
            ) {
                throw new Error(
                    "The server returned an invalid recommendation response."
                );
            }

            setResult(data);
        } catch (err) {
            console.error("Crop recommendation error:", err);

            setError(
                err.message ||
                    "Something went wrong while getting the recommendation."
            );
        } finally {
            setLoading(false);
        }
    };

    const getRankEmoji = (rank) => {
        if (rank === 1) return "🥇";
        if (rank === 2) return "🥈";
        if (rank === 3) return "🥉";
        return "🌱";
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-8">

            {/* Header */}
            <div className="max-w-5xl mx-auto mb-8">

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mb-5 text-green-700 font-medium hover:text-green-800 hover:underline"
                >
                    ← Back to Home
                </button>

                <h1 className="text-3xl md:text-4xl font-bold text-green-800">
                    🌾 Crop Recommendation
                </h1>

                <p className="text-gray-600 mt-2">
                    Enter your soil, weather and farming conditions to get
                    an AI-powered crop recommendation.
                </p>
            </div>

            {/* Form */}
            <form
                onSubmit={getRecommendation}
                className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
            >
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                    🌱 Farm Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                    {/* Nitrogen */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nitrogen (N)
                        </label>

                        <input
                            name="nitrogen"
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.nitrogen}
                            onChange={handleChange}
                            placeholder="e.g. 90"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Phosphorus */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Phosphorus (P)
                        </label>

                        <input
                            name="phosphorus"
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.phosphorus}
                            onChange={handleChange}
                            placeholder="e.g. 42"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Potassium */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Potassium (K)
                        </label>

                        <input
                            name="potassium"
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.potassium}
                            onChange={handleChange}
                            placeholder="e.g. 43"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Temperature */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Temperature (°C)
                        </label>

                        <input
                            name="temperature"
                            type="number"
                            step="0.1"
                            value={form.temperature}
                            onChange={handleChange}
                            placeholder="e.g. 25.5"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Humidity */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Humidity (%)
                        </label>

                        <input
                            name="humidity"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={form.humidity}
                            onChange={handleChange}
                            placeholder="e.g. 80"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* pH */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Soil pH
                        </label>

                        <input
                            name="ph"
                            type="number"
                            min="0"
                            max="14"
                            step="0.1"
                            value={form.ph}
                            onChange={handleChange}
                            placeholder="e.g. 6.5"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Rainfall */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rainfall (mm)
                        </label>

                        <input
                            name="rainfall"
                            type="number"
                            min="0"
                            step="0.1"
                            value={form.rainfall}
                            onChange={handleChange}
                            placeholder="e.g. 200"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Soil Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Soil Type
                        </label>

                        <select
                            name="soilType"
                            value={form.soilType}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="">
                                Select soil type
                            </option>
                            <option value="Black">
                                Black Soil
                            </option>
                            <option value="Red">
                                Red Soil
                            </option>
                            <option value="Alluvial">
                                Alluvial Soil
                            </option>
                            <option value="Loamy">
                                Loamy Soil
                            </option>
                            <option value="Sandy">
                                Sandy Soil
                            </option>
                            <option value="Clay">
                                Clay Soil
                            </option>
                            <option value="Laterite">
                                Laterite Soil
                            </option>
                        </select>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                        </label>

                        <input
                            name="location"
                            type="text"
                            value={form.location}
                            onChange={handleChange}
                            placeholder="e.g. Nagpur, Maharashtra"
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                    </div>

                    {/* Season */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Season
                        </label>

                        <select
                            name="season"
                            value={form.season}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="">
                                Select season
                            </option>
                            <option value="Kharif">
                                Kharif
                            </option>
                            <option value="Rabi">
                                Rabi
                            </option>
                            <option value="Zaid">
                                Zaid
                            </option>
                        </select>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        <p className="font-medium">
                            {error}
                        </p>
                    </div>
                )}

                {/* Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading
                        ? "🌱 Analyzing your farm..."
                        : "🌾 Get Crop Recommendation"}
                </button>
            </form>

            {/* Results */}
            {result?.recommendations?.length > 0 && (
                <div className="max-w-5xl mx-auto mt-8">

                    <div className="mb-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-green-800">
                            🌱 AI Crop Recommendations
                        </h2>

                        <p className="text-gray-600 mt-2">
                            Based on your soil, weather, location and season.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                        {result.recommendations.map(
                            (recommendation, index) => (
                                <div
                                    key={
                                        recommendation.rank ??
                                        recommendation.crop ??
                                        index
                                    }
                                    className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition"
                                >
                                    {/* Rank Header */}
                                    <div className="bg-green-600 text-white px-5 py-4 flex items-center justify-between">
                                        <span className="text-lg font-bold">
                                            {getRankEmoji(
                                                recommendation.rank
                                            )}{" "}
                                            #{recommendation.rank}
                                        </span>

                                        <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                                            {recommendation.suitability}
                                        </span>
                                    </div>

                                    <div className="p-5">

                                        {/* Crop Name */}
                                        <h3 className="text-2xl font-bold text-gray-800">
                                            {recommendation.crop}
                                        </h3>

                                        {/* Reason */}
                                        <div className="mt-4">
                                            <h4 className="font-semibold text-green-700">
                                                Why this crop?
                                            </h4>

                                            <p className="text-gray-600 text-sm leading-6 mt-1">
                                                {recommendation.reason}
                                            </p>
                                        </div>

                                        {/* Quick Information */}
                                        <div className="grid grid-cols-2 gap-3 mt-5">

                                            <div className="bg-blue-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500">
                                                    💧 Water
                                                </p>

                                                <p className="font-semibold text-gray-800 mt-1">
                                                    {recommendation.waterRequirement ||
                                                        "Not specified"}
                                                </p>
                                            </div>

                                            <div className="bg-orange-50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500">
                                                    📅 Growing Period
                                                </p>

                                                <p className="font-semibold text-gray-800 mt-1">
                                                    {recommendation.growingPeriod ||
                                                        "Not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Farmer Advice */}
                                        <div className="mt-5 bg-green-50 rounded-xl p-4">
                                            <h4 className="font-semibold text-green-800">
                                                🌱 Farmer Advice
                                            </h4>

                                            <p className="text-gray-700 text-sm leading-6 mt-1">
                                                {recommendation.advice ||
                                                    "No additional advice provided."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )
                        )}
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-800">
                            <strong>Note:</strong> These recommendations are
                            based on the information you provided. Actual crop
                            performance can vary depending on local weather,
                            soil conditions, seed quality, irrigation and
                            farming practices.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
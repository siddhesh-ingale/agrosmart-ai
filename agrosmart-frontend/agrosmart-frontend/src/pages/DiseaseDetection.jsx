import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DiseaseDetection() {
    const navigate = useNavigate();

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [cropName, setCropName] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Check authentication when page opens
    useEffect(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    from: "/disease-detection",
                },
            });
        }
    }, [navigate]);

    // Clean up image preview URL
    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleImageChange = (e) => {
        const selectedImage = e.target.files?.[0];

        if (!selectedImage) {
            return;
        }

        setError("");
        setResult(null);

        // Check image type
        if (!selectedImage.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            e.target.value = "";
            return;
        }

        // Maximum image size: 10 MB
        const maxSize = 10 * 1024 * 1024;

        if (selectedImage.size > maxSize) {
            setError("Image size must be less than 10 MB.");
            e.target.value = "";
            return;
        }

        // Create preview
        const imageUrl = URL.createObjectURL(selectedImage);

        setImage(selectedImage);
        setPreview(imageUrl);
    };

    const detectDisease = async (e) => {
        e.preventDefault();

        setError("");
        setResult(null);

        // Validate crop name
        if (!cropName.trim()) {
            setError("Please enter the crop name.");
            return;
        }

        // Validate image
        if (!image) {
            setError("Please upload a crop image.");
            return;
        }

        // Check token
        const token = localStorage.getItem("token");

        if (!token) {
            navigate("/login", {
                replace: true,
                state: {
                    from: "/disease-detection",
                },
            });

            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("image", image);
            formData.append("cropName", cropName.trim());

            const response = await fetch(
                "http://localhost:8080/api/v1/disease/detect",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
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

            // Token expired or unauthorized
            if (
                response.status === 401 ||
                response.status === 403
            ) {
                localStorage.removeItem("token");

                navigate("/login", {
                    replace: true,
                    state: {
                        from: "/disease-detection",
                    },
                });

                return;
            }

            // Other backend errors
            if (!response.ok) {
                throw new Error(
                    data.message ||
                        data.error ||
                        "Unable to analyze the image."
                );
            }

            // Validate response
            if (!data || typeof data !== "object") {
                throw new Error(
                    "The server returned an invalid response."
                );
            }

            setResult(data);
        } catch (err) {
            console.error(
                "Disease detection error:",
                err
            );

            setError(
                err.message ||
                    "Something went wrong while analyzing the crop."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 py-8">

            {/* ================= HEADER ================= */}
            <div className="max-w-5xl mx-auto mb-8">

                <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="mb-5 text-green-700 font-medium hover:text-green-800 hover:underline"
                >
                    ← Back to Home
                </button>

                <p className="text-green-600 font-semibold text-sm">
                    🌱 AI CROP HEALTH
                </p>

                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mt-1">
                    🔍 Crop Disease Detection
                </h1>

                <p className="text-gray-600 mt-2 max-w-2xl">
                    Upload a clear image of your crop and let
                    Agrosmart AI analyze possible diseases,
                    symptoms and recommended next steps.
                </p>
            </div>

            {/* ================= UPLOAD CARD ================= */}
            <div className="max-w-5xl mx-auto">

                <form
                    onSubmit={detectDisease}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 md:p-8"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* ================= LEFT ================= */}
                        <div>

                            <h2 className="text-xl font-bold text-gray-800">
                                📷 Upload Crop Image
                            </h2>

                            <p className="text-gray-500 text-sm mt-1">
                                For better results, use a clear image
                                showing the affected part of the plant.
                            </p>

                            {/* Crop Name */}
                            <div className="mt-6">

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Crop Name
                                </label>

                                <input
                                    type="text"
                                    placeholder="e.g. Tomato, Cotton, Soybean"
                                    value={cropName}
                                    onChange={(e) =>
                                        setCropName(e.target.value)
                                    }
                                    required
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                />

                            </div>

                            {/* Image Upload */}
                            <div className="mt-5">

                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Crop Image
                                </label>

                                <label
                                    htmlFor="crop-image"
                                    className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-green-300 rounded-xl bg-green-50 hover:bg-green-100 cursor-pointer transition"
                                >
                                    <div className="text-4xl mb-2">
                                        📸
                                    </div>

                                    <p className="text-sm font-semibold text-green-700">
                                        Click to upload image
                                    </p>

                                    <p className="text-xs text-gray-500 mt-1">
                                        JPG, PNG or JPEG • Max 10 MB
                                    </p>
                                </label>

                                <input
                                    id="crop-image"
                                    type="file"
                                    accept="image/jpeg,image/png,image/jpg,image/webp"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />

                                {/* Selected File */}
                                {image && (
                                    <p className="text-sm text-gray-500 mt-2 truncate">
                                        📄 {image.name}
                                    </p>
                                )}

                            </div>

                            {/* Error */}
                            {error && (
                                <div className="mt-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                                    ⚠️ {error}
                                </div>
                            )}

                            {/* Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? "🔬 Analyzing Crop..."
                                    : "🔍 Detect Disease"}
                            </button>

                        </div>

                        {/* ================= RIGHT ================= */}
                        <div>

                            <h2 className="text-xl font-bold text-gray-800">
                                🖼️ Image Preview
                            </h2>

                            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-2xl min-h-[320px] flex items-center justify-center overflow-hidden">

                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Selected crop"
                                        className="w-full h-[320px] object-contain"
                                    />
                                ) : (
                                    <div className="text-center px-6">

                                        <div className="text-6xl mb-4">
                                            🌿
                                        </div>

                                        <p className="font-semibold text-gray-600">
                                            No image selected
                                        </p>

                                        <p className="text-sm text-gray-400 mt-1">
                                            Your crop image will appear here.
                                        </p>

                                    </div>
                                )}

                            </div>

                        </div>

                    </div>
                </form>

                {/* ================= LOADING ================= */}
                {loading && (
                    <div className="mt-6 bg-white rounded-2xl border border-green-100 shadow-sm p-6 text-center">

                        <div className="text-4xl animate-pulse">
                            🌱
                        </div>

                        <h3 className="font-semibold text-gray-800 mt-3">
                            Agrosmart AI is analyzing your crop...
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Please wait while we examine the uploaded image.
                        </p>

                    </div>
                )}

                {/* ================= RESULT ================= */}
                {result && !loading && (
                    <div className="mt-8">

                        {/* Result Header */}
                        <div className="mb-6">

                            <h2 className="text-2xl md:text-3xl font-bold text-green-800">
                                🌱 Disease Analysis
                            </h2>

                            <p className="text-gray-500 mt-1">
                                AI-generated analysis based on your
                                uploaded crop image.
                            </p>

                        </div>

                        {/* Disease Main Card */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

                            {/* Top Section */}
                            <div className="bg-gradient-to-r from-green-700 to-emerald-600 p-6 text-white">

                                <p className="text-green-100 text-sm font-medium">
                                    DETECTED CONDITION
                                </p>

                                <h2 className="text-2xl md:text-3xl font-bold mt-1">
                                    {result.disease || "Unknown"}
                                </h2>

                                <div className="flex flex-wrap gap-3 mt-4">

                                    <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                                        🎯 Confidence:{" "}
                                        {result.confidence || "N/A"}
                                    </span>

                                    <span className="bg-white/20 px-4 py-2 rounded-full text-sm">
                                        ⚠️ Severity:{" "}
                                        {result.severity || "N/A"}
                                    </span>

                                </div>

                            </div>

                            {/* Result Content */}
                            <div className="p-6 md:p-8">

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                    {/* Symptoms */}
                                    <div className="bg-orange-50 rounded-xl p-5">

                                        <h3 className="font-bold text-orange-800">
                                            🔎 Symptoms
                                        </h3>

                                        <p className="text-gray-700 text-sm leading-6 mt-2">
                                            {result.symptoms ||
                                                "No symptoms provided."}
                                        </p>

                                    </div>

                                    {/* Possible Causes */}
                                    <div className="bg-yellow-50 rounded-xl p-5">

                                        <h3 className="font-bold text-yellow-800">
                                            🧩 Possible Causes
                                        </h3>

                                        <p className="text-gray-700 text-sm leading-6 mt-2">
                                            {result.possibleCauses ||
                                                "No causes provided."}
                                        </p>

                                    </div>

                                    {/* Immediate Actions */}
                                    {result.immediateActions && (
                                        <div className="bg-blue-50 rounded-xl p-5">

                                            <h3 className="font-bold text-blue-800">
                                                🚨 What To Do Now
                                            </h3>

                                            <ul className="mt-2 space-y-2">

                                                {Array.isArray(
                                                    result.immediateActions
                                                ) ? (
                                                    result.immediateActions.map(
                                                        (action, index) => (
                                                            <li
                                                                key={index}
                                                                className="text-gray-700 text-sm leading-6 flex gap-2"
                                                            >
                                                                <span>•</span>
                                                                <span>
                                                                    {action}
                                                                </span>
                                                            </li>
                                                        )
                                                    )
                                                ) : (
                                                    <li className="text-gray-700 text-sm">
                                                        {
                                                            result.immediateActions
                                                        }
                                                    </li>
                                                )}

                                            </ul>

                                        </div>
                                    )}

                                    {/* Treatment */}
                                    <div className="bg-green-50 rounded-xl p-5">

                                        <h3 className="font-bold text-green-800">
                                            🌿 Treatment Guidance
                                        </h3>

                                        <p className="text-gray-700 text-sm leading-6 mt-2">
                                            {result.treatment ||
                                                "No treatment information provided."}
                                        </p>

                                    </div>

                                </div>

                                {/* Prevention */}
                                {result.prevention && (
                                    <div className="mt-6 bg-purple-50 rounded-xl p-5">

                                        <h3 className="font-bold text-purple-800">
                                            🛡️ Prevention
                                        </h3>

                                        {Array.isArray(
                                            result.prevention
                                        ) ? (
                                            <ul className="mt-2 space-y-2">

                                                {result.prevention.map(
                                                    (item, index) => (
                                                        <li
                                                            key={index}
                                                            className="text-gray-700 text-sm flex gap-2"
                                                        >
                                                            <span>✓</span>
                                                            <span>
                                                                {item}
                                                            </span>
                                                        </li>
                                                    )
                                                )}

                                            </ul>
                                        ) : (
                                            <p className="text-gray-700 text-sm leading-6 mt-2">
                                                {result.prevention}
                                            </p>
                                        )}

                                    </div>
                                )}

                                {/* Farmer Advice */}
                                <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-5">

                                    <h3 className="font-bold text-green-800">
                                        👨‍🌾 Farmer Advice
                                    </h3>

                                    <p className="text-gray-700 text-sm leading-6 mt-2">
                                        {result.farmerAdvice ||
                                            "Please consult a local agricultural expert for further guidance."}
                                    </p>

                                </div>

                                {/* Disclaimer */}
                                <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">

                                    <p className="text-xs text-gray-500 leading-5">
                                        <strong>Important:</strong>{" "}
                                        This AI analysis is provided for
                                        agricultural guidance and should
                                        not be treated as a guaranteed
                                        diagnosis. For serious crop damage
                                        or chemical treatment decisions,
                                        consult a qualified agricultural
                                        expert or local agriculture
                                        authority.
                                    </p>

                                </div>

                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
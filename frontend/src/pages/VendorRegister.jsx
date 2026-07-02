import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { registerVendor } from "../api/authApi";

export default function VendorRegister() {
  const [name, setName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const navigate = useNavigate();

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error(
        "Geolocation is not supported by your browser. Please enter your coordinates manually.",
      );
      return;
    }

    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        console.log("📍 Geolocation detected:", { lat, lng });
        setLatitude(lat);
        setLongitude(lng);
        toast.success(
          `📍 Location detected! (${lat.toFixed(4)}, ${lng.toFixed(4)})\nReady to register.`,
        );
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
        console.error("❌ Geolocation error:", error);
        let errorMsg =
          "Unable to retrieve your location. Please enter it manually.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg =
            "Location permission denied. Please enable location access in your browser settings and try again.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg =
            "Location information is unavailable. Please enter your coordinates manually.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg =
            "Location detection timed out. Please enter your coordinates manually.";
        }
        toast.error(errorMsg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !locationName ||
      !email ||
      !password ||
      latitude === "" ||
      longitude === ""
    ) {
      toast.error(
        'All fields are required. Please add your shop location and use "Current Location" or enter coordinates manually.',
      );
      return;
    }

    if (isNaN(Number(latitude)) || isNaN(Number(longitude))) {
      toast.error("Latitude and Longitude must be valid numbers.");
      return;
    }

    // Store location as GeoJSON format: [longitude, latitude]
    const payload = {
      name,
      locationName,
      email,
      password,
      role: "vendor",
      latitude: Number(latitude),
      longitude: Number(longitude),
      location: {
        type: "Point",
        coordinates: [Number(longitude), Number(latitude)],
      },
    };

    console.log("📤 Submitting registration with location:", {
      latitude: payload.latitude,
      longitude: payload.longitude,
      coordinates: payload.location.coordinates,
    });

    try {
      setLoading(true);
      const res = await registerVendor(payload);
      toast.success(
        res.data.message || "Registration successful. Please login.",
      );
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("❌ Registration error:", err.response?.data);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa] p-6">
      <div className="w-full max-w-[480px] rounded-[12px] bg-white p-10 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-[22px]">🔗</span>
          <span className="text-[18px] font-bold tracking-[-0.3px] text-[#4f46e5]">
            VendorLink
          </span>
        </div>

        <h2 className="mb-[6px] text-2xl font-bold text-[#1a1a2e]">
          Vendor Registration
        </h2>
        <p className="mb-7 text-sm text-gray-500">
          Create your VendorLink account
        </p>

        <form onSubmit={handleRegister} noValidate>
          <div className="mb-4 flex flex-col">
            <label
              className="mb-[6px] text-[13px] font-semibold text-gray-700"
              htmlFor="name"
            >
              Store Name
            </label>
            <input
              id="name"
              type="text"
              placeholder="e.g. Shop1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
            />
          </div>

          <div className="mb-4 flex flex-col">
            <label
              className="mb-[6px] text-[13px] font-semibold text-gray-700"
              htmlFor="email"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="vendor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
            />
          </div>

          <div className="mb-4 flex flex-col">
            <label
              className="mb-[6px] text-[13px] font-semibold text-gray-700"
              htmlFor="locationName"
            >
              Shop Location
            </label>
            <input
              id="locationName"
              type="text"
              placeholder="e.g. Salt Lake, Kolkata"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
            />
          </div>

          <div className="mb-4 flex flex-col">
            <label
              className="mb-[6px] text-[13px] font-semibold text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="box-border w-full rounded-lg border border-gray-300 px-[14px] py-[10px] text-sm outline-none"
            />
          </div>

          <div className="flex gap-3">
            <div className="mb-4 flex flex-1 flex-col">
              <label
                className="mb-[6px] text-[13px] font-semibold text-gray-700"
                htmlFor="latitude"
              >
                Latitude {latitude && <span className="text-green-600">✓</span>}
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g. 28.6139"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className={`box-border w-full rounded-lg border-2 px-[14px] py-[10px] text-sm outline-none transition-colors ${
                  latitude ? "border-green-300 bg-green-50" : "border-gray-300"
                }`}
              />
            </div>
            <div className="mb-4 flex flex-1 flex-col">
              <label
                className="mb-[6px] text-[13px] font-semibold text-gray-700"
                htmlFor="longitude"
              >
                Longitude{" "}
                {longitude && <span className="text-green-600">✓</span>}
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g. 77.2090"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className={`box-border w-full rounded-lg border-2 px-[14px] py-[10px] text-sm outline-none transition-colors ${
                  longitude ? "border-green-300 bg-green-50" : "border-gray-300"
                }`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={detectingLocation}
            className={`mb-2 w-full rounded-lg border border-dashed border-[#6366f1] bg-[#eef2ff] p-[9px] text-[13px] font-semibold text-[#4f46e5] transition-opacity ${
              detectingLocation ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {detectingLocation
              ? "⏳ Detecting your location..."
              : "📍 Use My Current Location"}
          </button>
          <p className="mb-4 text-[11px] text-gray-500 px-1">
            {latitude && longitude ? (
              <span className="text-green-600">
                ✓ Location detected and ready!
              </span>
            ) : (
              <span>
                Click above to detect, or manually enter your coordinates below.
              </span>
            )}
          </p>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-lg bg-[#4f46e5] p-3 text-[15px] font-semibold text-white transition-opacity duration-200 ${
              loading ? "opacity-70" : "opacity-100"
            }`}
          >
            {loading ? "Registering..." : "Register as Vendor"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-[#4f46e5] no-underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

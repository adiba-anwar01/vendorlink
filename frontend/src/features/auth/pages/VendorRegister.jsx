import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { registerVendor } from "../api/authApi";
import { inputField, btnPrimary } from "@/utils/theme";

export default function VendorRegister() {
  const [name, setName] = useState("");
  const [locationName, setLocationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setLatitude(lat);
        setLongitude(lng);
        toast.success(
          `📍 Location detected! (${lat.toFixed(4)}, ${lng.toFixed(4)})\nReady to register.`,
        );
        setDetectingLocation(false);
      },
      (error) => {
        setDetectingLocation(false);
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

    try {
      setLoading(true);
      const res = await registerVendor(payload);
      localStorage.setItem(
        `vendorMeta:${email}`,
        JSON.stringify({
          name,
          email,
          role: "vendor",
          locationName,
          location: {
            type: "Point",
            coordinates: [Number(longitude), Number(latitude)],
          },
          latitude: Number(latitude),
          longitude: Number(longitude),
        }),
      );
      toast.success(
        res.data.message || "Registration successful. Please login.",
      );
      navigate("/login", { replace: true });
    } catch (err) {
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6 animate-page-enter">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 ease-out w-full max-w-lg p-10">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-2xl">🔗</span>
          <span className="text-lg font-bold text-gradient-primary">VendorLink</span>
        </div>

        <h2 className="mb-1.5 text-2xl font-bold text-gray-900">
          Vendor Registration
        </h2>
        <p className="mb-7 text-sm text-gray-500">
          Create your VendorLink account
        </p>

        <form onSubmit={handleRegister} noValidate>
          <div className="mb-4 flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
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
              className={inputField}
            />
          </div>

          <div className="mb-4 flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
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
              className={inputField}
            />
          </div>

          <div className="mb-4 flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
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
              className={inputField}
            />
          </div>

          <div className="mb-4 flex flex-col gap-1.5">
            <label
              className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputField} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-500 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="mb-4 flex flex-1 flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
                htmlFor="latitude"
              >
                Latitude{" "}
                {latitude && (
                  <span className="text-emerald-600 normal-case">✓</span>
                )}
              </label>
              <input
                id="latitude"
                type="number"
                step="any"
                placeholder="e.g. 28.6139"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className={`w-full border-2 rounded-[0.625rem] px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/20 transition-colors ${latitude ? "border-emerald-300 bg-emerald-50" : "border-gray-200"}`}
              />
            </div>
            <div className="mb-4 flex flex-1 flex-col gap-1.5">
              <label
                className="text-xs font-semibold text-gray-700 uppercase tracking-wide"
                htmlFor="longitude"
              >
                Longitude{" "}
                {longitude && (
                  <span className="text-emerald-600 normal-case">✓</span>
                )}
              </label>
              <input
                id="longitude"
                type="number"
                step="any"
                placeholder="e.g. 77.2090"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className={`w-full border-2 rounded-[0.625rem] px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-500 focus:ring-3 focus:ring-brand-500/20 transition-colors ${longitude ? "border-emerald-300 bg-emerald-50" : "border-gray-200"}`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleGetLocation}
            disabled={detectingLocation}
            className="inline-flex items-center justify-center w-full gap-1.5 px-4 py-2 rounded-[0.625rem] bg-white border-2 border-dashed border-brand-300 text-gradient-primary text-sm font-medium hover:border-brand-400 hover:bg-brand-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-2"
          >
            {detectingLocation
              ? "⏳ Detecting your location..."
              : "📍 Use My Current Location"}
          </button>
          <p className="mb-4 text-xs text-gray-500 px-1">
            {latitude && longitude ? (
              <span className="text-emerald-600">
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
            className={`${btnPrimary} w-full py-3 flex items-center justify-center`}
          >
            {loading ? "Registering..." : "Register as Vendor"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-gradient-primary">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

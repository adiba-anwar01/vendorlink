import { useRef, useState } from "react";
import { Upload, X, Loader } from "lucide-react";
import { uploadImage } from "../../api/productApi";
import { toast } from "react-toastify";

export default function ImageUploader({
  value = [],
  onChange,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFiles = async (files) => {
    setUploading(true);
    const uploadedImages = [];

    try {
      for (const file of Array.from(files)) {
        try {
          // Upload to Cloudinary via backend
          const res = await uploadImage(file);
          uploadedImages.push({
            id: `${Date.now()}-${Math.random()}`,
            url: res.data.url,
            publicId: res.data.publicId,
          });
        } catch (error) {
          toast.error(`Failed to upload ${file.name}`);
          console.error("Upload error:", error);
        }
      }

      if (uploadedImages.length > 0) {
        onChange([...value, ...uploadedImages]);
        toast.success(
          `${uploadedImages.length} image(s) uploaded successfully!`,
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled && !uploading) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const removeImage = (id) => {
    onChange(value.filter((img) => img.id !== id));
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && !uploading && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          !disabled && !uploading && setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 transition-colors ${
          uploading
            ? "border-gray-300 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed opacity-60"
            : dragging
              ? "border-gray-400 bg-gray-50 dark:bg-gray-800"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer"
        }`}
      >
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
          {uploading ? (
            <Loader className="w-5 h-5 text-gray-500 dark:text-gray-400 animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">
            {uploading ? "Uploading..." : "Click to upload"}
          </span>
          {!uploading && " or drag & drop"}
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        disabled={uploading || disabled}
        className="hidden"
        onChange={(e) => uploadFiles(e.target.files)}
      />

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {value.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage(img.id);
                }}
                disabled={uploading}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-gray-900/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

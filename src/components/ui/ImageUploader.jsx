import { useRef, useState } from 'react';
import { Upload, X, Image } from 'lucide-react';

export default function ImageUploader({ value = [], onChange }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = (files) => {
    const newPreviews = Array.from(files).map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      url: URL.createObjectURL(file),
    }));
    onChange([...value, ...newPreviews]);
  };

  const removeImage = (id) => {
    onChange(value.filter((img) => img.id !== id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl p-8 cursor-pointer transition-colors ${
          dragging
            ? 'border-gray-400 bg-gray-50 dark:bg-gray-800'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60'
        }`}
      >
        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
          <Upload className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium text-gray-900 dark:text-white">Click to upload</span> or drag & drop
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10MB</p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      {/* Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {value.map((img) => (
            <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                className="absolute top-1.5 right-1.5 w-5 h-5 bg-gray-900/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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

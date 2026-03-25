import { Image, Edit2, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge';

export default function ProductCard({ product, onEdit, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="card card-hover overflow-hidden group">
      {/* Image */}
      <div className="relative h-36 bg-gray-100 overflow-hidden">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-10 h-10 text-gray-300" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-2.5 left-2.5">
          <Badge status={product.status} />
        </div>
        {/* Price overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent
          opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
          {product.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5">
          <span className="text-sm font-bold text-gray-900">${product.price.toLocaleString()}</span>
          <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
            {product.condition}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col items-center gap-1.5">
          <button
            onClick={() => navigate(`/products/${product.id}`)}
            className="btn-ghost flex-auto text-xs py-1 px-3 border border-gray-200 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 w-full max-w-[150px] rounded-lg"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" /> View Details
          </button>
          <div className="flex items-center justify-center gap-2 w-full max-w-[150px]">
            <button
              onClick={() => navigate(`/products/${product.id}`)}
              className="btn-secondary flex-1 text-xs py-1 px-3 rounded-lg"
            >
              <Edit2 className="w-3.5 h-3.5 shrink-0" /> Edit
            </button>
            <button
              onClick={() => onDelete?.(product)}
              className="btn-danger flex-1 text-xs py-1 px-3 rounded-lg"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

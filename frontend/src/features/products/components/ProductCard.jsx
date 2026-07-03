import { Image } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui";
import { formatPrice } from "@/utils/priceUtils";
import { cardClass, btnSecondary, btnDanger } from "@/utils/theme";

export default function ProductCard({ product, onDelete }) {
  const navigate = useNavigate();

  return (
    <div
      className={`${cardClass} overflow-hidden group flex flex-col h-full`}
    >
      <div className="relative h-40 bg-gray-100 overflow-hidden shrink-0">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Image className="w-8 h-8 text-gray-300" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <Badge status={product.status} />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
          {product.title}
        </h3>

        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gradient-primary w-fit">
            {formatPrice(product.price)}
          </span>
          <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {product.condition}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-gray-100 mt-auto">
          <button
            onClick={() => navigate(`/products/${product._id ?? product.id}`)}
            className={btnSecondary}
          >
            Details
          </button>

          <button
            onClick={() =>
              navigate(`/products/${product._id ?? product.id}/edit`)
            }
            className={btnSecondary}
          >
            Edit
          </button>

          <button onClick={() => onDelete?.(product)} className={btnDanger}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

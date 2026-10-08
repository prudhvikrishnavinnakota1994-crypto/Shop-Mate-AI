import React, { useState } from 'react';
import { Heart, Scale, Star, Check, ShoppingBag, Sparkles, TrendingDown, MapPin } from 'lucide-react';
import { Product, formatINR } from '../data/products';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  isCompared: boolean;
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onAskCopilot: (product: Product) => void;
  onOpenNearbyStores?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  isCompared,
  onToggleWishlist,
  onToggleCompare,
  onSelectProduct,
  onAddToCart,
  onAskCopilot,
  onOpenNearbyStores
}) => {
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const bestStore = product.storeOffers.reduce((prev, curr) =>
    curr.price < prev.price ? curr : prev
  );

  return (
    <article
      onClick={() => onSelectProduct(product)}
      className="group relative flex flex-col rounded-[16px] bg-[#FFFFFF] border border-[#E2E8F0] p-[16px] elevation-1 elevation-2-hover cursor-pointer"
    >
      {/* 1. Image Container (1:1 aspect ratio, neutral #F8FAFC backing, 10px inner radius) */}
      <div className="relative aspect-square w-full rounded-[10px] bg-[#F8FAFC] overflow-hidden mb-3 flex items-center justify-center border border-[#F1F5F9]">
        {/* Top Floating Badges & Action Controls */}
        <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5">
            {product.isAiPick && (
              <span
                className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-full text-[11px] font-semibold tracking-[0.02em] text-white font-display shadow-xs whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)'
                }}
              >
                <span aria-hidden="true">✦</span> AI Pick
              </span>
            )}
            <span className="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-semibold tracking-[0.02em] bg-[#ECFDF5] border border-[#10B981]/25 text-[#059669] font-display price-tabular whitespace-nowrap">
              {product.matchScore}% Match
            </span>
          </div>

          {/* Right Action Cluster: Compare & Wishlist */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(product.id);
              }}
              title={isCompared ? 'Remove from comparison' : 'Compare specifications'}
              aria-label="Compare product"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                isCompared
                  ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                  : 'bg-white/90 hover:bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(product.id);
              }}
              title={isWishlisted ? 'Remove from saved' : 'Save price alert & wishlist'}
              aria-label="Save to wishlist"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border ${
                isWishlisted
                  ? 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#EF4444]'
                  : 'bg-white/90 hover:bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#EF4444]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#EF4444]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Product Studio Photography or Resilient Fallback */}
        {!imgError ? (
          <img
            src={product.image}
            alt={product.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            style={product.imageFilterStyle ? { filter: product.imageFilterStyle } : undefined}
            className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-200 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#F8FAFC] to-[#EEF2FF]">
            <ShoppingBag className="w-10 h-10 text-[#6366F1] mb-2 opacity-75" />
            <span className="text-xs font-medium text-[#334155] font-display line-clamp-2">
              {product.brand} {product.category}
            </span>
          </div>
        )}

        {/* Bottom-left subtle price-trend indicator on image */}
        {product.price === product.lowest90d && (
          <div className="absolute bottom-2.5 left-2.5 z-10 inline-flex items-center gap-1 h-[22px] px-2 rounded-md bg-[#F0FDF4]/95 border border-[#86EFAC] text-[#15803D] text-[11px] font-semibold font-display">
            <TrendingDown className="w-3 h-3" />
            <span>90-Day Low</span>
          </div>
        )}
      </div>

      {/* 2. Clean Unboxed Metadata Line (Zero-Pill Discipline) */}
      <div className="flex items-center gap-1.5 text-[12px] text-[#64748B] mb-1 truncate">
        <span className="font-medium text-[#334155]">{product.brand}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{product.quickSpecs[0]}</span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{product.quickSpecs[1]}</span>
      </div>

      {/* 3. Body: Title in 2-line clamped Plus Jakarta Sans + Rating Line */}
      <h3 className="font-display text-[15px] font-semibold leading-[21px] text-[#0F172A] line-clamp-2 mb-2 group-hover:text-[#4F46E5] transition-colors">
        {product.title}
      </h3>

      <div className="flex items-center justify-between gap-2 mb-3 text-[12px]">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-semibold font-display price-tabular">
            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
            {product.rating.toFixed(1)}
          </span>
          <span className="text-[#64748B] price-tabular">
            ({product.reviewCount.toLocaleString('en-IN')})
          </span>
        </div>
        {onOpenNearbyStores && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenNearbyStores(product);
            }}
            className="text-[11px] font-semibold text-[#059669] hover:text-[#047857] inline-flex items-center gap-1"
          >
            <MapPin className="w-3 h-3 text-[#10B981]" />
            <span>Nearby Stores</span>
          </button>
        )}
      </div>

      {/* 4. "Why ShopMate Recommends": Distinct AI callout micro-box */}
      <div className="bg-[#F8FAFC] border-l-2 border-[#6366F1] rounded-r-[8px] px-2.5 py-2 mb-4">
        <div className="flex items-center justify-between gap-1 mb-0.5">
          <span className="text-[11px] font-semibold text-[#4F46E5] font-display tracking-[0.01em]">
            Why ShopMate Recommends
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAskCopilot(product);
            }}
            className="text-[11px] font-medium text-[#6366F1] hover:text-[#4F46E5] inline-flex items-center gap-0.5 whitespace-nowrap"
          >
            <Sparkles className="w-2.5 h-2.5" />
            Ask AI
          </button>
        </div>
        <p className="text-[12px] leading-[17px] text-[#334155] font-body line-clamp-2">
          {product.aiReason}
        </p>
      </div>

      {/* 5. Footer: Price layout displaying ₹[Amount] in bold price-lg, crossed-out MRP, % savings, and Pill CTA */}
      <div className="mt-auto pt-2 border-t border-[#F1F5F9]">
        <div className="flex items-baseline justify-between gap-2 mb-3">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-[22px] font-bold leading-[28px] text-[#0F172A] price-tabular">
              {formatINR(product.price)}
            </span>
            <span className="text-[13px] text-[#64748B] line-through price-tabular">
              {formatINR(product.mrp)}
            </span>
          </div>
          <span className="text-[12px] font-semibold text-[#059669] bg-[#ECFDF5] px-2 py-0.5 rounded-md font-display price-tabular whitespace-nowrap">
            Save {product.discountPercent}%
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className={`w-full h-[42px] px-4 rounded-full font-display text-[13px] font-semibold flex items-center justify-center gap-2 whitespace-nowrap transition-all ${
              justAdded
                ? 'bg-[#10B981] text-white shadow-xs'
                : 'btn-primary-pill'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Bag · {formatINR(product.price)}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
};

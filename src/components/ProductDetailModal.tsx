import React, { useState } from 'react';
import {
  X,
  Star,
  Check,
  ShoppingBag,
  Scale,
  Heart,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  Tag,
  Bell,
  Truck,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Product, formatINR } from '../data/products';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  isWishlisted: boolean;
  isCompared: boolean;
  onToggleWishlist: (id: string) => void;
  onToggleCompare: (id: string) => void;
  onAddToCart: (product: Product, customPrice?: number, appliedCoupon?: string) => void;
  onAskCopilot: (product: Product) => void;
  onOpenNearbyStores?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  isWishlisted,
  isCompared,
  onToggleWishlist,
  onToggleCompare,
  onAddToCart,
  onAskCopilot,
  onOpenNearbyStores
}) => {
  if (!product) return null;

  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.name || 'Standard');
  const [couponApplied, setCouponApplied] = useState(false);
  const [priceAlertSaved, setPriceAlertSaved] = useState(false);
  const [targetAlertPrice, setTargetAlertPrice] = useState(
    Math.round((product.price * 0.92) / 100) * 100
  );
  const [addedFeedback, setAddedFeedback] = useState(false);

  const bestCouponOffer = product.storeOffers.find((o) => o.couponCode && o.couponDiscount);
  const activeDiscount = couponApplied && bestCouponOffer?.couponDiscount ? bestCouponOffer.couponDiscount : 0;
  const effectivePrice = product.price - activeDiscount;

  const handleAddToBag = () => {
    onAddToCart(
      product,
      effectivePrice,
      couponApplied && bestCouponOffer ? bestCouponOffer.couponCode : undefined
    );
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1400);
  };

  // Compute SVG points for 90-day price history sparkline
  const prices = product.priceHistory90d.map((p) => p.price);
  const minP = Math.min(...prices) * 0.96;
  const maxP = Math.max(...prices) * 1.02;
  const svgWidth = 420;
  const svgHeight = 110;

  const points = product.priceHistory90d
    .map((pt, idx) => {
      const x = (idx / (product.priceHistory90d.length - 1)) * (svgWidth - 32) + 16;
      const y = svgHeight - 24 - ((pt.price - minP) / (maxP - minP)) * (svgHeight - 44);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[1040px] max-h-[90vh] overflow-y-auto rounded-[16px] bg-white border border-[#6366F1]/25 elevation-3-ai p-6 md:p-8"
      >
        {/* Top Modal Close & Action Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2 text-[12px] text-[#64748B]">
            <span className="font-medium text-[#334155]">{product.category}</span>
            <span aria-hidden="true">·</span>
            <span>{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#059669] font-medium">Verified India Retail Stock</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenNearbyStores && (
              <button
                type="button"
                onClick={() => onOpenNearbyStores(product)}
                className="h-[34px] px-3 rounded-full text-[12px] font-semibold font-display flex items-center gap-1.5 border border-[#10B981]/30 bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5] transition-colors"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Google Maps Store Finder</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onToggleCompare(product.id)}
              className={`h-[34px] px-3 rounded-full text-[12px] font-semibold font-display flex items-center gap-1.5 border transition-colors ${
                isCompared
                  ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                  : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>{isCompared ? 'In Comparison' : 'Add to Compare'}</span>
            </button>
            <button
              type="button"
              onClick={() => onToggleWishlist(product.id)}
              className={`h-[34px] px-3 rounded-full text-[12px] font-semibold font-display flex items-center gap-1.5 border transition-colors ${
                isWishlisted
                  ? 'bg-[#FEF2F2] border-[#EF4444]/30 text-[#EF4444]'
                  : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#EF4444]' : ''}`} />
              <span>{isWishlisted ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-[34px] h-[34px] rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#334155]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Contiguous PDP Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column (5 cols): Gallery + 90-Day Price History + Price Alert */}
          <div className="lg:col-span-5 space-y-5">
            <div className="relative aspect-square w-full rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] overflow-hidden flex items-center justify-center">
              <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                {product.isAiPick && (
                  <span
                    className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-full text-[11px] font-semibold text-white font-display"
                    style={{
                      background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)'
                    }}
                  >
                    ✦ AI Pick
                  </span>
                )}
                <span className="inline-flex items-center h-[24px] px-2.5 rounded-full text-[11px] font-semibold bg-[#ECFDF5] border border-[#10B981]/25 text-[#059669] font-display price-tabular">
                  {product.matchScore}% Match
                </span>
              </div>

              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                style={product.imageFilterStyle ? { filter: product.imageFilterStyle } : undefined}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Finish / Variant Selector */}
            <div>
              <div className="text-[12px] font-semibold text-[#334155] font-display mb-2">
                Selected Finish: <span className="text-[#0F172A]">{selectedVariant}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.name}
                    type="button"
                    onClick={() => setSelectedVariant(v.name)}
                    className={`h-[32px] px-3 rounded-full text-[12px] font-semibold font-display flex items-center gap-2 border transition-colors ${
                      selectedVariant === v.name
                        ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                        : 'bg-white border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-black/15"
                      style={{ backgroundColor: v.hex }}
                    />
                    <span>{v.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 90-Day Price History Sparkline Card */}
            <div className="rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-display text-[13px] font-bold text-[#0F172A] flex items-center gap-1.5">
                    <TrendingDown className="w-4 h-4 text-[#10B981]" />
                    <span>90-Day India Price History</span>
                  </h4>
                  <p className="text-[11px] text-[#64748B]">
                    Current price is {formatINR(product.average90d - product.price)} below 90-day average
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-display text-[11px] font-semibold price-tabular">
                  Buy Confidence: High
                </span>
              </div>

              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-[96px] overflow-visible"
              >
                <defs>
                  <linearGradient id="priceLineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <polygon
                  points={`16,${svgHeight - 20} ${points} ${svgWidth - 16},${svgHeight - 20}`}
                  fill="url(#priceLineGrad)"
                />
                <polyline
                  fill="none"
                  stroke="#6366F1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points}
                />
                {product.priceHistory90d.map((pt, idx) => {
                  const x = (idx / (product.priceHistory90d.length - 1)) * (svgWidth - 32) + 16;
                  const y =
                    svgHeight - 24 - ((pt.price - minP) / (maxP - minP)) * (svgHeight - 44);
                  const isLast = idx === product.priceHistory90d.length - 1;
                  return (
                    <g key={pt.label}>
                      <circle
                        cx={x}
                        cy={y}
                        r={isLast ? 4.5 : 3}
                        fill={isLast ? '#10B981' : '#6366F1'}
                        stroke="#FFFFFF"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y={svgHeight - 4}
                        textAnchor="middle"
                        className="fill-[#64748B] text-[9px] font-display"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="grid grid-cols-3 gap-2 pt-2 mt-1 border-t border-[#E2E8F0] text-center">
                <div>
                  <div className="text-[10px] text-[#64748B]">90d Lowest</div>
                  <div className="font-display text-[13px] font-bold text-[#059669] price-tabular">
                    {formatINR(product.lowest90d)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B]">90d Average</div>
                  <div className="font-display text-[13px] font-semibold text-[#334155] price-tabular">
                    {formatINR(product.average90d)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#64748B]">90d Peak</div>
                  <div className="font-display text-[13px] font-semibold text-[#64748B] price-tabular">
                    {formatINR(product.highest90d)}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Price Drop Alert Setter */}
            <div className="rounded-[12px] bg-white border border-[#E2E8F0] p-3.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-display text-[12px] font-semibold text-[#0F172A]">
                    Target Price Drop Alert
                  </div>
                  <div className="text-[11px] text-[#64748B] price-tabular">
                    Notify me if price drops below {formatINR(targetAlertPrice)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step={100}
                  value={targetAlertPrice}
                  onChange={(e) => setTargetAlertPrice(Number(e.target.value) || product.price)}
                  aria-label="Target price in INR"
                  className="w-20 h-[32px] px-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[12px] font-semibold font-display price-tabular text-[#0F172A]"
                />
                <button
                  type="button"
                  onClick={() => setPriceAlertSaved(!priceAlertSaved)}
                  className={`h-[32px] px-3 rounded-full text-[11px] font-semibold font-display whitespace-nowrap transition-colors ${
                    priceAlertSaved
                      ? 'bg-[#ECFDF5] text-[#059669] border border-[#10B981]/30'
                      : 'bg-[#0F172A] text-white hover:bg-[#1E293B]'
                  }`}
                >
                  {priceAlertSaved ? 'Alert Active ✓' : 'Set Alert'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Contiguous Purchase Module + AI Reasoning + Store Comparison */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <h2 className="font-display text-[22px] md:text-[24px] font-bold leading-[30px] text-[#0F172A] mb-2">
                {product.title}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-[13px]">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] font-semibold font-display price-tabular">
                  <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                  {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString('en-IN')} verified reviews)
                </span>
                <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
                <span className="inline-flex items-center gap-1 text-[#059669] font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  Official India Warranty Included
                </span>
              </div>
            </div>

            {/* Contiguous Pricing & Primary CTA Box */}
            <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] p-5 space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <div className="text-[11px] font-semibold text-[#64748B] font-display mb-0.5">
                    {couponApplied ? 'Effective Net Price (Smart Coupon Applied)' : 'Best Verified Store Price'}
                  </div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="font-display text-[30px] font-bold leading-[36px] text-[#0F172A] price-tabular">
                      {formatINR(effectivePrice)}
                    </span>
                    <span className="text-[15px] text-[#64748B] line-through price-tabular">
                      {formatINR(product.mrp)}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-[#ECFDF5] text-[#059669] font-display text-[12px] font-semibold price-tabular">
                      Save {formatINR(product.mrp - effectivePrice)} ({Math.round(((product.mrp - effectivePrice) / product.mrp) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Smart Coupon Claim Button (Match / Deal Action: #10B981) */}
                {bestCouponOffer && (
                  <button
                    type="button"
                    onClick={() => setCouponApplied(!couponApplied)}
                    className={`h-[36px] px-3.5 rounded-full font-display text-[12px] font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                      couponApplied
                        ? 'bg-[#ECFDF5] border border-[#10B981] text-[#059669]'
                        : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-xs'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>
                      {couponApplied
                        ? `Coupon ${bestCouponOffer.couponCode} Applied (-${formatINR(bestCouponOffer.couponDiscount!)})`
                        : `Apply ${bestCouponOffer.couponCode} (-${formatINR(bestCouponOffer.couponDiscount!)})`}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleAddToBag}
                  className={`w-full sm:flex-1 h-[46px] px-6 rounded-full font-display text-[14px] font-semibold flex items-center justify-center gap-2 transition-all ${
                    addedFeedback ? 'bg-[#10B981] text-white' : 'btn-primary-pill'
                  }`}
                >
                  {addedFeedback ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Shopping Bag</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Shopping Bag · {formatINR(effectivePrice)}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onAskCopilot(product);
                  }}
                  className="w-full sm:w-auto h-[46px] px-5 rounded-full bg-white hover:bg-[#EEF2FF] border border-[#6366F1]/30 text-[#4F46E5] font-display text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Ask AI Copilot</span>
                </button>
              </div>

              {/* Try In Store Google Maps Grounding Launcher */}
              {onOpenNearbyStores && (
                <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[12px] text-[#334155]">
                    <MapPin className="w-4 h-4 text-[#EF4444]" />
                    <span>Want to try this in person before buying?</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenNearbyStores(product)}
                    className="text-[12px] font-bold text-[#059669] hover:underline flex items-center gap-1"
                  >
                    <span>Check Google Maps Showrooms →</span>
                  </button>
                </div>
              )}
            </div>

            {/* Luminescent AI Recommendation Analysis Block */}
            <div className="luminescent-ai-block rounded-[14px] p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-display text-[13px] font-bold text-[#4F46E5] flex items-center gap-1.5">
                  <span aria-hidden="true">✦</span> ShopMate AI Verdict — {product.matchScore}% Match
                </span>
                <span className="text-[11px] text-[#64748B]">
                  Synthesized from {product.reviewCount.toLocaleString('en-IN')} buyer reviews
                </span>
              </div>

              <p className="font-display text-[14px] font-semibold text-[#0F172A]">
                {product.aiDeepAnalysis.verdictHeadline}
              </p>
              <p className="text-[13px] leading-[20px] text-[#334155]">
                {product.aiDeepAnalysis.buyerSentiment}
              </p>

              {/* 4-Pillar Score Bars */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                {[
                  { label: 'Value / ₹', val: product.aiDeepAnalysis.scores.valueForMoney },
                  { label: 'Performance', val: product.aiDeepAnalysis.scores.performance },
                  { label: 'Build Quality', val: product.aiDeepAnalysis.scores.buildQuality },
                  { label: 'India Support', val: product.aiDeepAnalysis.scores.afterSalesIndia }
                ].map((s) => (
                  <div key={s.label} className="bg-white/80 rounded-[10px] p-2.5 border border-[#E0E7FF]">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#475569] font-medium">{s.label}</span>
                      <span className="font-display font-bold text-[#0F172A] price-tabular">
                        {s.val}/100
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#6366F1]"
                        style={{ width: `${s.val}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Pros & Cons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="bg-white/80 rounded-[10px] p-3 border border-[#E0E7FF] space-y-1.5">
                  <div className="text-[11px] font-bold text-[#059669] font-display">
                    Why Buyers Love It
                  </div>
                  {product.aiDeepAnalysis.pros.map((pro, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[12px] text-[#334155]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                      <span>{pro}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white/80 rounded-[10px] p-3 border border-[#E0E7FF] space-y-1.5">
                  <div className="text-[11px] font-bold text-[#B45309] font-display">
                    Trade-offs to Consider
                  </div>
                  {product.aiDeepAnalysis.cons.map((con, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[12px] text-[#334155]">
                      <AlertCircle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                      <span>{con}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Multi-Store Price Comparison Table */}
            <div>
              <h3 className="font-display text-[14px] font-bold text-[#0F172A] mb-2.5">
                Live Multi-Store Price Comparison
              </h3>
              <div className="rounded-[12px] border border-[#E2E8F0] overflow-hidden divide-y divide-[#E2E8F0]">
                {product.storeOffers.map((offer, idx) => (
                  <div
                    key={offer.store}
                    className={`p-3 flex flex-wrap items-center justify-between gap-3 ${
                      idx === 0 ? 'bg-[#ECFDF5]/40' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-display text-[13px] font-semibold text-[#0F172A] w-28">
                        {offer.store}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[12px] text-[#64748B]">
                        <Truck className="w-3.5 h-3.5 text-[#6366F1]" />
                        {offer.delivery}
                      </span>
                      {offer.couponCode && (
                        <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold font-display price-tabular">
                          Code {offer.couponCode}: -{formatINR(offer.couponDiscount!)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-display text-[15px] font-bold text-[#0F172A] price-tabular">
                        {formatINR(offer.price)}
                      </span>
                      <button
                        type="button"
                        disabled={!offer.inStock}
                        onClick={() => {
                          onAddToCart(product, offer.price, offer.couponCode);
                          setAddedFeedback(true);
                          setTimeout(() => setAddedFeedback(false), 1200);
                        }}
                        className={`h-[30px] px-3 rounded-full text-[11px] font-semibold font-display transition-colors ${
                          offer.inStock
                            ? idx === 0
                              ? 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
                              : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] hover:bg-[#F1F5F9]'
                            : 'bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed'
                        }`}
                      >
                        {offer.inStock ? 'Select Offer' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specifications Grid */}
            <div>
              <h3 className="font-display text-[14px] font-bold text-[#0F172A] mb-2.5">
                Key Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-2"
                  >
                    <div className="text-[11px] text-[#64748B]">{spec.label}</div>
                    <div className="text-[12px] font-semibold text-[#0F172A] font-display">
                      {spec.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Scale,
  Sparkles,
  Star,
  Check,
  X,
  ShoppingBag,
  Plus,
  Trophy,
  TrendingDown,
  MapPin
} from 'lucide-react';
import { Product, PRODUCTS, formatINR } from '../data/products';

interface CompareViewProps {
  compareIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSwitchToDiscover: () => void;
  onOpenNearbyStores?: (product: Product) => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  compareIds,
  onToggleCompare,
  onSelectProduct,
  onAddToCart,
  onSwitchToDiscover,
  onOpenNearbyStores
}) => {
  const comparedProducts = PRODUCTS.filter((p) => compareIds.includes(p.id));
  const uncomparedProducts = PRODUCTS.filter((p) => !compareIds.includes(p.id));

  // Determine highest match score winner
  const winner =
    comparedProducts.length > 0
      ? comparedProducts.reduce((prev, curr) =>
          curr.matchScore > prev.matchScore ? curr : prev
        )
      : null;

  return (
    <div className="space-y-6">
      {/* Header & AI Comparison Verdict */}
      <div className="luminescent-ai-block rounded-[16px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[#4F46E5] font-display">
            <Sparkles className="w-4 h-4" />
            <span>ShopMate Side-by-Side AI Decision Matrix</span>
          </div>
          <h2 className="font-display text-[22px] font-bold text-[#0F172A]">
            {winner
              ? `Top AI Verdict: ${winner.brand} (${winner.matchScore}% Match at ${formatINR(winner.price)})`
              : 'Select up to 4 products to run a side-by-side AI comparison'}
          </h2>
          <p className="text-[13px] text-[#334155] max-w-2xl">
            {winner
              ? `${winner.aiReason} Compared against ${comparedProducts.length - 1} other candidate(s) on 90-day Indian retail pricing, acoustic/build telemetry, and verified warranty coverage.`
              : 'Compare real-world specifications, 90-day lowest prices in ₹, and verified Indian buyer pros & cons.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToDiscover}
          className="h-[40px] px-4 rounded-full bg-white hover:bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] font-display text-[13px] font-semibold whitespace-nowrap self-start md:self-center transition-colors"
        >
          ← Back to Catalog
        </button>
      </div>

      {/* Quick Add Product Bar if < 4 items */}
      {comparedProducts.length < 4 && (
        <div className="rounded-[14px] bg-white border border-[#E2E8F0] p-4 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[13px] font-semibold text-[#334155] font-display">
            Add another product to compare ({comparedProducts.length}/4 selected):
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {uncomparedProducts.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onToggleCompare(p.id)}
                className="h-[32px] px-3 rounded-full bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] hover:border-[#6366F1] text-[12px] font-semibold font-display text-[#334155] hover:text-[#4F46E5] flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>
                  {p.brand} ({formatINR(p.price)})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {comparedProducts.length === 0 ? (
        <div className="rounded-[16px] bg-white border border-[#E2E8F0] p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center mx-auto">
            <Scale className="w-6 h-6" />
          </div>
          <h3 className="font-display text-[18px] font-bold text-[#0F172A]">
            No products in your comparison tray yet
          </h3>
          <p className="text-[14px] text-[#64748B] max-w-md mx-auto">
            Click the scale icon on any product card or select from the quick-add chips above to compare specifications and 90-day ₹ price history.
          </p>
        </div>
      ) : (
        <div className="rounded-[16px] bg-white border border-[#E2E8F0] elevation-1 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-[#E2E8F0]">
                <th className="w-44 p-4 bg-[#F8FAFC] font-display text-[12px] font-semibold text-[#64748B] align-top">
                  Product & AI Score
                </th>
                {comparedProducts.map((item) => {
                  const isWinner = winner?.id === item.id && comparedProducts.length > 1;
                  return (
                    <th
                      key={item.id}
                      className={`p-4 align-top border-l border-[#E2E8F0] w-60 ${
                        isWinner ? 'bg-[#F5F3FF]/50' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        {isWinner ? (
                          <span
                            className="inline-flex items-center gap-1 h-[22px] px-2.5 rounded-full text-[11px] font-semibold text-white font-display"
                            style={{
                              background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)'
                            }}
                          >
                            <Trophy className="w-3 h-3" />
                            <span>AI Winner</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center h-[22px] px-2 rounded-full text-[11px] font-semibold bg-[#ECFDF5] text-[#059669] font-display price-tabular">
                            {item.matchScore}% Match
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => onToggleCompare(item.id)}
                          title="Remove from comparison"
                          className="w-6 h-6 rounded-full bg-[#F8FAFC] hover:bg-[#FEE2E2] text-[#64748B] hover:text-[#EF4444] flex items-center justify-center transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div
                        onClick={() => onSelectProduct(item)}
                        className="cursor-pointer group"
                      >
                        <div className="aspect-square w-28 h-28 mx-auto mb-3 rounded-[10px] bg-[#F8FAFC] border border-[#F1F5F9] overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            style={
                              item.imageFilterStyle
                                ? { filter: item.imageFilterStyle }
                                : undefined
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <div className="text-[11px] text-[#64748B] font-medium mb-0.5">
                          {item.brand} · {item.category}
                        </div>
                        <div className="font-display text-[14px] font-semibold text-[#0F172A] group-hover:text-[#4F46E5] line-clamp-2 mb-2">
                          {item.title}
                        </div>
                      </div>

                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-display text-[20px] font-bold text-[#0F172A] price-tabular">
                          {formatINR(item.price)}
                        </span>
                        <span className="text-[12px] text-[#64748B] line-through price-tabular">
                          {formatINR(item.mrp)}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <button
                          type="button"
                          onClick={() => onAddToCart(item)}
                          className="w-full h-[36px] rounded-full btn-primary-pill text-[12px] flex items-center justify-center gap-1.5"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                        {onOpenNearbyStores && (
                          <button
                            type="button"
                            onClick={() => onOpenNearbyStores(item)}
                            className="w-full h-[30px] rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] font-display text-[11px] font-semibold flex items-center justify-center gap-1 border border-[#10B981]/25 transition-colors"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Nearby Stores (Maps)</span>
                          </button>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-[13px]">
              {/* Row 1: AI Match Score & Rating */}
              <tr>
                <td className="p-4 bg-[#F8FAFC] font-display font-semibold text-[#334155]">
                  Match & Rating
                </td>
                {comparedProducts.map((item) => (
                  <td key={item.id} className="p-4 border-l border-[#E2E8F0] price-tabular">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-display font-bold text-[12px]">
                        {item.matchScore}% Match
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#B45309] font-semibold">
                        <Star className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                        {item.rating.toFixed(1)} ({item.reviewCount.toLocaleString('en-IN')})
                      </span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* Row 2: 90-Day Price Intelligence */}
              <tr>
                <td className="p-4 bg-[#F8FAFC] font-display font-semibold text-[#334155]">
                  90-Day Price Intel
                </td>
                {comparedProducts.map((item) => (
                  <td key={item.id} className="p-4 border-l border-[#E2E8F0] price-tabular space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#64748B]">90d Low:</span>
                      <span className="font-bold text-[#059669]">
                        {formatINR(item.lowest90d)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-[#64748B]">90d Avg:</span>
                      <span className="font-medium text-[#334155]">
                        {formatINR(item.average90d)}
                      </span>
                    </div>
                    {item.price === item.lowest90d && (
                      <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#15803D] pt-0.5">
                        <TrendingDown className="w-3 h-3" />
                        <span>Trading at 90-day lowest</span>
                      </div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Row 3: Best Store & Active Coupon */}
              <tr>
                <td className="p-4 bg-[#F8FAFC] font-display font-semibold text-[#334155]">
                  Lowest Store & Coupon
                </td>
                {comparedProducts.map((item) => {
                  const best = item.storeOffers[0];
                  return (
                    <td key={item.id} className="p-4 border-l border-[#E2E8F0]">
                      <div className="font-display font-semibold text-[#0F172A]">
                        {best.store} — <span className="price-tabular">{formatINR(best.price)}</span>
                      </div>
                      <div className="text-[12px] text-[#64748B]">{best.delivery}</div>
                      {best.couponCode && (
                        <div className="mt-1 inline-block px-2 py-0.5 rounded bg-[#ECFDF5] text-[#059669] text-[11px] font-semibold font-display price-tabular">
                          Use {best.couponCode} (-{formatINR(best.couponDiscount!)})
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: AI Score Breakdown */}
              <tr>
                <td className="p-4 bg-[#F8FAFC] font-display font-semibold text-[#334155]">
                  AI Sub-Scores
                </td>
                {comparedProducts.map((item) => (
                  <td key={item.id} className="p-4 border-l border-[#E2E8F0] space-y-2 price-tabular">
                    {[
                      { label: 'Value for ₹', val: item.aiDeepAnalysis.scores.valueForMoney },
                      { label: 'Performance', val: item.aiDeepAnalysis.scores.performance },
                      { label: 'Build Quality', val: item.aiDeepAnalysis.scores.buildQuality },
                      { label: 'India Warranty', val: item.aiDeepAnalysis.scores.afterSalesIndia }
                    ].map((sc) => (
                      <div key={sc.label}>
                        <div className="flex justify-between text-[11px] mb-0.5">
                          <span className="text-[#64748B]">{sc.label}</span>
                          <span className="font-semibold text-[#0F172A]">{sc.val}/100</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[#F1F5F9]">
                          <div
                            className="h-full rounded-full bg-[#6366F1]"
                            style={{ width: `${sc.val}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Row 5: Key Highlights */}
              <tr>
                <td className="p-4 bg-[#F8FAFC] font-display font-semibold text-[#334155]">
                  Key Specifications
                </td>
                {comparedProducts.map((item) => (
                  <td key={item.id} className="p-4 border-l border-[#E2E8F0] space-y-1.5">
                    {item.quickSpecs.map((qs) => (
                      <div key={qs} className="flex items-center gap-1.5 text-[12px] text-[#334155]">
                        <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
                        <span>{qs}</span>
                      </div>
                    ))}
                  </td>
                ))}
              </tr>

              {/* Row 6: Why ShopMate Recommends */}
              <tr>
                <td className="p-4 bg-[#F8FAFC] font-display font-semibold text-[#334155]">
                  ShopMate Reasoning
                </td>
                {comparedProducts.map((item) => (
                  <td key={item.id} className="p-4 border-l border-[#E2E8F0] text-[12px] leading-[18px] text-[#334155]">
                    <div className="bg-[#F8FAFC] border-l-2 border-[#6366F1] pl-2.5 py-1">
                      {item.aiReason}
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

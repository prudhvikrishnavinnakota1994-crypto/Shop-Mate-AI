import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Sparkles,
  FileText
} from 'lucide-react';
import { Product, formatINR } from '../data/products';

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  appliedCoupon?: string;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart
}) => {
  const [step, setStep] = useState<'bag' | 'checkout' | 'confirmed'>('bag');
  const [smartPromoApplied, setSmartPromoApplied] = useState(true);
  const [customerName, setCustomerName] = useState('Aarav Sharma');
  const [phone, setPhone] = useState('+91 98450 72109');
  const [pincode, setPincode] = useState('560001');
  const [address, setAddress] = useState('42 Residency Road, Ashok Nagar, Bengaluru');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod' | 'card'>('upi');
  const [confirmedOrderId, setConfirmedOrderId] = useState('SM-8492');

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.product.mrp * item.quantity, 0);
  const promoDiscount = smartPromoApplied && subtotal >= 4000 ? 500 : 0;
  const finalTotal = Math.max(0, subtotal - promoDiscount);
  const totalSavings = mrpTotal - finalTotal;
  const gstIncluded = Math.round(finalTotal * 0.18);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const randomId = `SM-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrderId(randomId);
    setStep('confirmed');
  };

  const handleFinishConfirmation = () => {
    onClearCart();
    setStep('bag');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/45 backdrop-blur-xs flex justify-end"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] bg-white h-full flex flex-col border-l border-[#E2E8F0] shadow-2xl"
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display text-[16px] font-bold text-[#0F172A]">
                {step === 'bag' && 'Your Shopping Bag'}
                {step === 'checkout' && 'Express Verification & Checkout'}
                {step === 'confirmed' && `Order #${confirmedOrderId} Confirmed`}
              </h2>
              <p className="text-[11px] text-[#64748B]">
                {step === 'confirmed'
                  ? 'Official GST Tax Invoice & Tracking Ready'
                  : 'ShopMate Price Protection & Free Express Delivery'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#334155]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 && step !== 'confirmed' ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h3 className="font-display text-[16px] font-semibold text-[#0F172A]">
                Your shopping bag is empty
              </h3>
              <p className="text-[13px] text-[#64748B] max-w-xs mx-auto">
                Explore ShopMate AI picks or check local authorized showrooms on Google Maps.
              </p>
            </div>
          ) : step === 'bag' ? (
            <>
              {/* AI Smart Savings Banner */}
              <div className="rounded-[12px] bg-[#ECFDF5] border border-[#10B981]/30 p-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#059669] shrink-0" />
                  <div className="text-[12px] text-[#065F46]">
                    <span className="font-display font-bold">ShopMate Auto-Coupon:</span>{' '}
                    {smartPromoApplied
                      ? `Extra ${formatINR(promoDiscount)} off applied via SHOPMATE500`
                      : 'Apply SHOPMATE500 for extra ₹500 instant savings'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSmartPromoApplied(!smartPromoApplied)}
                  className="px-2.5 py-1 rounded-full bg-[#10B981] text-white font-display text-[11px] font-semibold whitespace-nowrap"
                >
                  {smartPromoApplied ? 'Applied ✓' : 'Apply'}
                </button>
              </div>

              {/* Cart Items List */}
              <div className="space-y-3">
                {items.map(({ product, quantity, unitPrice, appliedCoupon }) => (
                  <div
                    key={product.id}
                    className="rounded-[14px] bg-white border border-[#E2E8F0] p-3.5 flex gap-3.5 elevation-1"
                  >
                    <img
                      src={product.image}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      style={
                        product.imageFilterStyle
                          ? { filter: product.imageFilterStyle }
                          : undefined
                      }
                      className="w-18 h-18 rounded-[10px] object-cover bg-[#F8FAFC] border border-[#F1F5F9] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-display text-[13px] font-semibold text-[#0F172A] line-clamp-2">
                          {product.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(product.id)}
                          aria-label="Remove item"
                          className="text-[#94A3B8] hover:text-[#EF4444] p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        Fulfilled by {product.storeOffers[0].store} · {product.storeOffers[0].delivery}
                      </div>

                      {appliedCoupon && (
                        <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#059669] text-[10px] font-semibold font-display">
                          <Tag className="w-2.5 h-2.5" />
                          <span>Coupon {appliedCoupon} included</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#F1F5F9]">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-display text-[15px] font-bold text-[#0F172A] price-tabular">
                            {formatINR(unitPrice * quantity)}
                          </span>
                          <span className="text-[11px] text-[#64748B] line-through price-tabular">
                            {formatINR(product.mrp * quantity)}
                          </span>
                        </div>

                        <div className="inline-flex items-center rounded-full border border-[#E2E8F0] bg-[#F8FAFC] p-0.5">
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, -1)}
                            aria-label="Decrease quantity"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#334155] hover:bg-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-[12px] font-bold font-display price-tabular text-[#0F172A]">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQuantity(product.id, 1)}
                            aria-label="Increase quantity"
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[#334155] hover:bg-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : step === 'checkout' ? (
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-display text-[13px] font-bold text-[#0F172A]">
                  Delivery Address & Contact
                </h3>
                <div>
                  <label className="block text-[12px] font-medium text-[#334155] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-[44px] px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] font-medium text-[#334155] mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full h-[44px] px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] price-tabular focus:outline-none focus:border-[#6366F1] focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-medium text-[#334155] mb-1">
                      Postal PIN Code
                    </label>
                    <input
                      type="text"
                      required
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full h-[44px] px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] price-tabular focus:outline-none focus:border-[#6366F1] focus:bg-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#334155] mb-1">
                    Street Address & Landmark
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-[44px] px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] focus:outline-none focus:border-[#6366F1] focus:bg-white"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2 pt-2">
                <h3 className="font-display text-[13px] font-bold text-[#0F172A]">
                  Payment Method
                </h3>
                {[
                  {
                    id: 'upi' as const,
                    title: 'UPI Instant Pay (GPay, PhonePe, Cred)',
                    desc: 'Zero convenience fee · Instant refund protection'
                  },
                  {
                    id: 'cod' as const,
                    title: 'Cash / UPI on Delivery (COD)',
                    desc: 'Pay at doorstep upon package verification'
                  },
                  {
                    id: 'card' as const,
                    title: 'Credit / Debit Card (3 & 6 Mo No-Cost EMI)',
                    desc: 'HDFC, ICICI, SBI & Axis cards supported'
                  }
                ].map((pm) => (
                  <label
                    key={pm.id}
                    className={`flex items-start gap-3 p-3 rounded-[12px] border cursor-pointer transition-colors ${
                      paymentMethod === pm.id
                        ? 'bg-[#EEF2FF]/60 border-[#6366F1]'
                        : 'bg-white border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id)}
                      className="mt-1 accent-[#6366F1]"
                    />
                    <div>
                      <div className="font-display text-[13px] font-semibold text-[#0F172A]">
                        {pm.title}
                      </div>
                      <div className="text-[11px] text-[#64748B]">{pm.desc}</div>
                    </div>
                  </label>
                ))}
              </div>

              {/* Formal Legal & Invoice Manifest (Using INR strictly per spec) */}
              <div className="rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 space-y-1.5 text-[12px]">
                <div className="flex items-center gap-1.5 font-display font-bold text-[#0F172A] mb-1">
                  <FileText className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Tax Invoice & Legal Manifest (INR)</span>
                </div>
                <div className="flex justify-between text-[#64748B] price-tabular">
                  <span>Net Payable Amount (INR)</span>
                  <span className="font-semibold text-[#0F172A]">
                    INR {finalTotal.toLocaleString('en-IN')}.00
                  </span>
                </div>
                <div className="flex justify-between text-[#64748B] price-tabular">
                  <span>Included IGST / CGST (18%)</span>
                  <span>INR {gstIncluded.toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </form>
          ) : (
            /* Step === 'confirmed' */
            <div className="py-6 space-y-5">
              <div className="rounded-[16px] bg-[#ECFDF5] border border-[#10B981]/30 p-5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#10B981] text-white flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-display text-[18px] font-bold text-[#0F172A]">
                  Order #{confirmedOrderId} Confirmed — Preparing Shipment
                </h3>
                <p className="text-[13px] text-[#065F46]">
                  Dispatched to {customerName} ({pincode}) · Total Saved: {formatINR(totalSavings)}
                </p>
              </div>

              <div className="rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-2.5 text-[13px]">
                <div className="font-display font-bold text-[#0F172A]">
                  Shipment & Invoice Summary
                </div>
                <div className="flex justify-between text-[#334155]">
                  <span>Recipient</span>
                  <span className="font-medium">{customerName}</span>
                </div>
                <div className="flex justify-between text-[#334155]">
                  <span>Delivery Address</span>
                  <span className="font-medium text-right max-w-[220px] truncate">{address}</span>
                </div>
                <div className="flex justify-between text-[#334155]">
                  <span>Payment Mode</span>
                  <span className="font-medium uppercase">{paymentMethod}</span>
                </div>
                <div className="flex justify-between text-[#0F172A] font-display font-bold pt-2 border-t border-[#E2E8F0] price-tabular">
                  <span>Total Settled (INR Manifest)</span>
                  <span>{formatINR(finalTotal)} (INR {finalTotal.toLocaleString('en-IN')}.00)</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleFinishConfirmation}
                className="w-full h-[46px] rounded-full btn-primary-pill text-[14px]"
              >
                Continue Exploring ShopMate AI
              </button>
            </div>
          )}
        </div>

        {/* Drawer Footer for Bag & Checkout */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-5 bg-[#F8FAFC] border-t border-[#E2E8F0] space-y-3">
            <div className="space-y-1.5 text-[13px] price-tabular">
              <div className="flex justify-between text-[#64748B]">
                <span>Total MRP ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                <span className="line-through">{formatINR(mrpTotal)}</span>
              </div>
              {promoDiscount > 0 && (
                <div className="flex justify-between text-[#059669] font-medium">
                  <span>ShopMate Smart Coupon (SHOPMATE500)</span>
                  <span>-{formatINR(promoDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#64748B]">
                <span className="inline-flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-[#10B981]" /> Express Delivery
                </span>
                <span className="text-[#059669] font-semibold">FREE</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#E2E8F0]">
                <div>
                  <span className="font-display text-[15px] font-bold text-[#0F172A]">
                    Total Payable
                  </span>
                  <span className="block text-[11px] text-[#059669] font-semibold">
                    You save {formatINR(totalSavings)} on this order
                  </span>
                </div>
                <span className="font-display text-[22px] font-bold text-[#0F172A]">
                  {formatINR(finalTotal)}
                </span>
              </div>
            </div>

            {step === 'bag' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full h-[46px] rounded-full btn-primary-pill text-[14px] flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Proceed to Express Checkout · {formatINR(finalTotal)}</span>
              </button>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setStep('bag')}
                  className="h-[46px] px-4 rounded-full bg-white border border-[#E2E8F0] text-[#0F172A] font-display text-[13px] font-semibold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 h-[46px] rounded-full bg-[#10B981] hover:bg-[#059669] text-white font-display text-[14px] font-semibold shadow-xs transition-colors"
                >
                  Confirm Order · {formatINR(finalTotal)}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

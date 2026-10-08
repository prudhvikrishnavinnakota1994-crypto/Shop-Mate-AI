import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Scale,
  ArrowUpRight,
  CheckCircle2,
  SlidersHorizontal,
  X,
  RotateCcw,
  Tag,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { Product, formatINR, ProductCategory } from '../data/products';

export interface GroundingLink {
  title: string;
  uri: string;
  snippets?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  timestamp: string;
  text: string;
  highlights?: string[];
  recommendedProducts?: Product[];
  suggestedFilter?: {
    label: string;
    category?: ProductCategory;
    maxPrice?: number;
  };
  couponCallout?: {
    code: string;
    description: string;
    discountINR: number;
  };
  mapsGroundingLinks?: GroundingLink[];
  mapsAction?: {
    label: string;
    productTitle?: string;
  };
}

interface AiCopilotRailProps {
  messages: ChatMessage[];
  onSendMessage: (query: string) => void;
  onSelectProduct: (product: Product) => void;
  onToggleCompare: (productId: string) => void;
  compareIds: string[];
  onApplyFilter: (category?: ProductCategory, maxPrice?: number) => void;
  onResetConversation: () => void;
  onCloseMobile?: () => void;
  onOpenNearbyStores?: (product?: Product) => void;
  onOpenLiveVoice?: () => void;
}

const FOLLOW_UP_PROMPTS = [
  '🎙️ Start Live Voice (gemini-3.8-live)',
  'Find authorized stores near me on Google Maps',
  'Best ANC headphones under ₹5,000?',
  'Compare Soundcore vs Sony ULT Wear',
  'Show all active coupon codes'
];

export const AiCopilotRail: React.FC<AiCopilotRailProps> = ({
  messages,
  onSendMessage,
  onSelectProduct,
  onToggleCompare,
  compareIds,
  onApplyFilter,
  onResetConversation,
  onCloseMobile,
  onOpenNearbyStores,
  onOpenLiveVoice
}) => {
  const [input, setInput] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1800);
  };

  return (
    <aside className="w-full lg:w-[360px] shrink-0 flex flex-col bg-[#FFFFFF] rounded-[16px] border border-[#6366F1]/20 elevation-3-ai overflow-hidden h-[640px] lg:h-[calc(100vh-112px)] lg:sticky lg:top-[88px]">
      {/* Copilot Header */}
      <div
        className="px-4 py-3.5 border-b border-[#E2E8F0] flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, #F5F3FF 0%, #EEF2FF 100%)'
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-xs shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)'
            }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-display text-[14px] font-bold text-[#0F172A]">
                ShopMate Copilot
              </h2>
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#ECFDF5] text-[#059669] border border-[#10B981]/20 font-display">
                <MapPin className="w-2.5 h-2.5" />
                Maps Grounded
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Google Maps stores & 90-day price intel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onOpenLiveVoice && (
            <button
              type="button"
              onClick={onOpenLiveVoice}
              title="Start Live Voice (gemini-3.8-live)"
              className="p-1.5 rounded-lg text-[#6366F1] hover:text-[#4F46E5] hover:bg-white/70 transition-colors flex items-center gap-1 text-[11px] font-semibold font-display"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              <span>Live Voice</span>
            </button>
          )}
          <button
            type="button"
            onClick={onResetConversation}
            title="Reset conversation"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-white/70 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              aria-label="Close Copilot"
              className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-white/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Conversation Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]/60">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            {msg.sender === 'user' ? (
              <div
                className="max-w-[85%] rounded-[14px] rounded-br-xs px-3.5 py-2.5 text-[13px] leading-[19px] text-white font-body shadow-xs"
                style={{
                  background: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)'
                }}
              >
                {msg.text}
              </div>
            ) : (
              <div className="w-full space-y-2.5">
                <div className="rounded-[14px] rounded-tl-xs bg-white border border-[#E2E8F0] p-3.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                    <span className="font-display font-semibold text-[#4F46E5] flex items-center gap-1">
                      <span aria-hidden="true">✦</span> ShopMate Reasoning
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <p className="text-[13px] leading-[20px] text-[#334155] font-body">
                    {msg.text}
                  </p>

                  {/* Bullet Highlights */}
                  {msg.highlights && msg.highlights.length > 0 && (
                    <ul className="space-y-1.5 pt-1 border-t border-[#F1F5F9]">
                      {msg.highlights.map((bullet, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-[12px] leading-[17px] text-[#334155]"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Google Maps Grounding Links (Mandatory extraction per Maps Grounding rule) */}
                  {msg.mapsGroundingLinks && msg.mapsGroundingLinks.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#F1F5F9]">
                      <div className="text-[11px] font-bold text-[#0F172A] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#EF4444]" />
                        <span>Google Maps Locations & Links</span>
                      </div>
                      <div className="space-y-1">
                        {msg.mapsGroundingLinks.map((link, lIdx) => (
                          <a
                            key={lIdx}
                            href={link.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] text-[11px] font-medium text-[#4F46E5] flex items-center justify-between gap-2 transition-colors"
                          >
                            <span className="truncate flex items-center gap-1.5">
                              <span className="text-[#EF4444]">📍</span>
                              <span className="truncate">{link.title}</span>
                            </span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Google Maps Action Launcher */}
                  {onOpenNearbyStores && (
                    <button
                      type="button"
                      onClick={() => onOpenNearbyStores()}
                      className="w-full h-[32px] px-3 rounded-lg bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#10B981]/30 text-[#059669] font-display text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Open Full Google Maps Store Locator</span>
                    </button>
                  )}

                  {/* Coupon Callout if present */}
                  {msg.couponCallout && (
                    <div className="rounded-[10px] bg-[#ECFDF5] border border-[#10B981]/30 p-2.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Tag className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-[#059669] font-display price-tabular">
                            Code: {msg.couponCallout.code} (Save {formatINR(msg.couponCallout.discountINR)})
                          </div>
                          <div className="text-[11px] text-[#065F46] truncate">
                            {msg.couponCallout.description}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyCoupon(msg.couponCallout!.code)}
                        className="px-2.5 py-1 rounded-full bg-[#10B981] text-white text-[11px] font-semibold font-display whitespace-nowrap hover:bg-[#059669] transition-colors"
                      >
                        {copiedCode === msg.couponCallout.code ? 'Copied ✓' : 'Copy'}
                      </button>
                    </div>
                  )}

                  {/* Suggested Filter Action Button */}
                  {msg.suggestedFilter && (
                    <button
                      type="button"
                      onClick={() =>
                        onApplyFilter(
                          msg.suggestedFilter?.category,
                          msg.suggestedFilter?.maxPrice
                        )
                      }
                      className="w-full h-[32px] px-3 rounded-lg bg-[#EEF2FF] hover:bg-[#E0E7FF] border border-[#6366F1]/30 text-[#4F46E5] font-display text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{msg.suggestedFilter.label}</span>
                    </button>
                  )}
                </div>

                {/* Mini Product Cards inside AI Response */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="space-y-2">
                    {msg.recommendedProducts.map((item) => {
                      const inCompare = compareIds.includes(item.id);
                      return (
                        <div
                          key={item.id}
                          onClick={() => onSelectProduct(item)}
                          className="group rounded-[12px] bg-white border border-[#E2E8F0] hover:border-[#6366F1]/50 p-2.5 flex items-center gap-3 cursor-pointer transition-all shadow-2xs"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            style={
                              item.imageFilterStyle
                                ? { filter: item.imageFilterStyle }
                                : undefined
                            }
                            className="w-12 h-12 rounded-[8px] object-cover bg-[#F8FAFC] shrink-0 border border-[#F1F5F9]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-[#ECFDF5] text-[#059669] font-display price-tabular">
                                {item.matchScore}% Match
                              </span>
                              <span className="text-[11px] text-[#64748B] truncate">
                                {item.brand}
                              </span>
                            </div>
                            <h4 className="font-display text-[12px] font-semibold text-[#0F172A] truncate group-hover:text-[#4F46E5]">
                              {item.title}
                            </h4>
                            <div className="flex items-center justify-between mt-1">
                              <span className="font-display text-[13px] font-bold text-[#0F172A] price-tabular">
                                {formatINR(item.price)}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleCompare(item.id);
                                  }}
                                  className={`px-2 py-0.5 rounded text-[10px] font-semibold font-display border transition-colors ${
                                    inCompare
                                      ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                                      : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]'
                                  }`}
                                >
                                  {inCompare ? 'Comparing' : '+ Compare'}
                                </button>
                                <span className="text-[#6366F1] group-hover:translate-x-0.5 transition-transform">
                                  <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-3 py-2 bg-white border-t border-[#F1F5F9] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {FOLLOW_UP_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => {
              if (prompt.includes('Live Voice') && onOpenLiveVoice) {
                onOpenLiveVoice();
              } else {
                onSendMessage(prompt);
              }
            }}
            className="h-[26px] px-2.5 rounded-full bg-[#6366F1]/[0.06] hover:bg-[#6366F1]/[0.12] border border-[#6366F1]/24 text-[#4F46E5] font-display text-[11px] font-semibold whitespace-nowrap shrink-0 flex items-center gap-1 transition-colors"
          >
            <span aria-hidden="true">✦</span>
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Copilot Input Form */}
      <form
        onSubmit={handleSubmit}
        className="p-3 bg-white border-t border-[#E2E8F0] flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask specs, warranty, or stores on Google Maps..."
          className="flex-1 h-[40px] px-3.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-[13px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1] focus:bg-white transition-colors"
        />
        <button
          type="submit"
          aria-label="Send message to ShopMate Copilot"
          className="w-[40px] h-[40px] rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white flex items-center justify-center shrink-0 shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </aside>
  );
};

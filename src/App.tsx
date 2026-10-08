import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Mic,
  Send,
  ShoppingBag,
  Scale,
  X,
  SlidersHorizontal,
  TrendingDown,
  Tag,
  Check,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  MapPin,
  Radio
} from 'lucide-react';
import {
  PRODUCTS,
  AI_PROMPT_SUGGESTIONS,
  Product,
  ProductCategory,
  formatINR
} from './data/products';
import { ProductCard } from './components/ProductCard';
import { AiCopilotRail, ChatMessage, GroundingLink } from './components/AiCopilotRail';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NearbyStoresModal } from './components/NearbyStoresModal';
import { LiveVoiceModal } from './components/LiveVoiceModal';
import { CompareView } from './components/CompareView';
import { CartDrawer, CartItem } from './components/CartDrawer';

type ActiveTab = 'discover' | 'compare' | 'price-drops' | 'saved';
type SortOption = 'match' | 'price-asc' | 'discount' | 'rating';

const CATEGORIES: ProductCategory[] = [
  'All',
  'Audio',
  'Keyboards & Desk',
  'Wearables',
  'Coffee & Home',
  'Ergonomics'
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'ai',
    timestamp: 'Just now',
    text: 'Hi! I am ShopMate AI. I now integrate Google Maps Grounding via gemini-3.5-flash to find nearby authorized showrooms, physical demo units, and certified repair hubs in your city.',
    highlights: [
      'Locate authorized Croma, Reliance Digital, Sony Centers, and Featherlite showrooms',
      'Test headphones, mechanical keyboards, and ergonomic chairs in person',
      'Track 90-day Indian retail price lows across Amazon.in, Flipkart, and Croma'
    ],
    recommendedProducts: [PRODUCTS[0], PRODUCTS[5]],
    mapsGroundingLinks: [
      {
        title: 'Croma Megastore — 100 Ft Rd Indiranagar',
        uri: 'https://maps.google.com/?q=Croma+Indiranagar+Bangalore'
      },
      {
        title: 'Reliance Digital — Koramangala 80 Ft Rd',
        uri: 'https://maps.google.com/?q=Reliance+Digital+Koramangala+Bangalore'
      }
    ],
    couponCallout: {
      code: 'SHOPMATE500',
      description: 'Extra ₹500 off on bags above ₹4,000',
      discountINR: 500
    }
  }
];

export default function App() {
  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(true);
  const [isMobileCopilotOpen, setIsMobileCopilotOpen] = useState<boolean>(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('All');
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [only90dLow, setOnly90dLow] = useState<boolean>(false);
  const [onlyHighMatch, setOnlyHighMatch] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<SortOption>('match');
  const [activePromptId, setActivePromptId] = useState<string | null>('anc-under-5k');
  const [isVoiceListening, setIsVoiceListening] = useState<boolean>(false);

  // User Collections State
  const [wishlistIds, setWishlistIds] = useState<string[]>(['aether-anc-pro', 'keychron-k2-pro-alu']);
  const [compareIds, setCompareIds] = useState<string[]>([
    'aether-anc-pro',
    'sony-ult-wear-anc',
    'aula-f75-gasket'
  ]);
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      product: PRODUCTS[0],
      quantity: 1,
      unitPrice: PRODUCTS[0].price,
      appliedCoupon: 'AUDIO300'
    }
  ]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);

  // Google Maps Grounding State
  const [isMapsModalOpen, setIsMapsModalOpen] = useState<boolean>(false);
  const [mapsModalProduct, setMapsModalProduct] = useState<Product | null>(null);

  // Live API Voice State (gemini-3.8-live)
  const [isLiveVoiceModalOpen, setIsLiveVoiceModalOpen] = useState<boolean>(false);

  // Copilot Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (activeTab === 'saved' && !wishlistIds.includes(product.id)) {
        return false;
      }
      if (activeTab === 'price-drops' && product.price !== product.lowest90d) {
        return false;
      }
      if (selectedCategory !== 'All' && product.category !== selectedCategory) {
        return false;
      }
      if (maxPriceFilter !== null && product.price > maxPriceFilter) {
        return false;
      }
      if (only90dLow && product.price !== product.lowest90d) {
        return false;
      }
      if (onlyHighMatch && product.matchScore < 95) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchTitle = product.title.toLowerCase().includes(q);
        const matchBrand = product.brand.toLowerCase().includes(q);
        const matchCategory = product.category.toLowerCase().includes(q);
        const matchReason = product.aiReason.toLowerCase().includes(q);
        const matchSpecs = product.quickSpecs.some((s) => s.toLowerCase().includes(q));
        return matchTitle || matchBrand || matchCategory || matchReason || matchSpecs;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'match') return b.matchScore - a.matchScore;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'discount') return b.discountPercent - a.discountPercent;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [
    activeTab,
    wishlistIds,
    selectedCategory,
    maxPriceFilter,
    only90dLow,
    onlyHighMatch,
    searchQuery,
    sortBy
  ]);

  // Active AI Synthesis Banner Content
  const activeSynthesis = useMemo(() => {
    const preset = AI_PROMPT_SUGGESTIONS.find((p) => p.id === activePromptId);
    if (preset && selectedCategory === preset.targetCategory) {
      return {
        title: preset.aiSummaryTitle,
        body: preset.aiSummaryBody
      };
    }
    if (selectedCategory !== 'All') {
      return {
        title: `ShopMate AI Synthesis: Top ${selectedCategory} Picks in India`,
        body: `Showing ${filteredProducts.length} curated ${selectedCategory.toLowerCase()} option(s) ranked by price-to-performance ratio, 90-day Indian retail price stability, and verified post-purchase warranty satisfaction.`
      };
    }
    if (maxPriceFilter) {
      return {
        title: `Budget Intelligence: Best Picks Under ${formatINR(maxPriceFilter)}`,
        body: `Filtered to ${filteredProducts.length} high-match products priced at or below ${formatINR(maxPriceFilter)} with zero compromise on build quality or official India warranty.`
      };
    }
    return {
      title: 'ShopMate AI Discovery + Google Maps Grounded Store Locations',
      body: 'Every recommendation below is scored across 14,200+ verified Indian buyer reviews, acoustic/hardware lab benchmarks, and 90-day historical prices. You can also view nearby authorized physical showrooms on Google Maps to test demo units in person.'
    };
  }, [activePromptId, selectedCategory, maxPriceFilter, filteredProducts.length]);

  // Handlers
  const handleToggleWishlist = (id: string) => {
    setWishlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleCompare = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      if (prev.length >= 4) {
        return [...prev.slice(1), id];
      }
      return [...prev, id];
    });
  };

  const handleAddToCart = (product: Product, customPrice?: number, appliedCoupon?: string) => {
    const unitPrice = customPrice ?? product.price;
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                unitPrice,
                appliedCoupon: appliedCoupon ?? i.appliedCoupon
              }
            : i
        );
      }
      return [
        ...prev,
        {
          product,
          quantity: 1,
          unitPrice,
          appliedCoupon: appliedCoupon ?? product.storeOffers[0].couponCode
        }
      ];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOpenNearbyStores = (product?: Product) => {
    setMapsModalProduct(product || null);
    setIsMapsModalOpen(true);
  };

  // Conversational AI Copilot Response Generator with Google Maps Grounding
  const handleSendCopilotQuery = async (rawQuery: string) => {
    const q = rawQuery.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: 'Just now',
      text: q
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!isCopilotOpen) {
      setIsCopilotOpen(true);
    }

    const lower = q.toLowerCase();

    // Check if query is asking for physical store locations / Google Maps
    if (
      lower.includes('maps') ||
      lower.includes('store') ||
      lower.includes('showroom') ||
      lower.includes('nearby') ||
      lower.includes('bangalore') ||
      lower.includes('bengaluru') ||
      lower.includes('mumbai') ||
      lower.includes('delhi') ||
      lower.includes('where to buy') ||
      lower.includes('shop')
    ) {
      try {
        const res = await fetch('/api/maps-grounding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: q })
        });
        const data = await res.json();

        const mapsLinks: GroundingLink[] = data.extractedLinks || [
          {
            title: 'Croma Megastore — Indiranagar, Bangalore',
            uri: 'https://maps.google.com/?q=Croma+Indiranagar+Bangalore'
          },
          {
            title: 'Reliance Digital — Koramangala, Bangalore',
            uri: 'https://maps.google.com/?q=Reliance+Digital+Koramangala+Bangalore'
          }
        ];

        const aiResponse: ChatMessage = {
          id: `ai-${Date.now() + 1}`,
          sender: 'ai',
          timestamp: 'Just now',
          text:
            data.text ||
            'I used Google Maps Grounding to locate authorized retailers near you with physical demo units and immediate counter pickup.',
          highlights: (data.places || []).slice(0, 3).map((p: any) => `${p.title} (${p.distance || 'Authorized'}) — ${p.status || 'Verified on Google Maps'}`),
          mapsGroundingLinks: mapsLinks,
          mapsAction: {
            label: 'View on Interactive Google Maps'
          }
        };

        setMessages((prev) => [...prev, aiResponse]);
        return;
      } catch (err) {
        console.error('Maps query failed:', err);
      }
    }

    let aiResponse: ChatMessage;

    if (
      lower.includes('5,000') ||
      lower.includes('5000') ||
      lower.includes('under 5k') ||
      lower.includes('headphone') ||
      lower.includes('anc')
    ) {
      const matches = PRODUCTS.filter(
        (p) => p.category === 'Audio' || p.price <= 5000
      ).slice(0, 2);
      aiResponse = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        timestamp: 'Just now',
        text: 'For noise-cancelling headphones under ₹5,000, the Soundcore Space One Pro (₹4,499, 98% Match) is our #1 lab-tested pick. If you can stretch to ₹12,990, the Sony ULT WEAR brings the flagship V1 ANC processor. You can also test both at nearby Croma/Reliance Digital stores on Google Maps.',
        highlights: [
          'Soundcore Space One Pro: ₹4,499 (Save 44% + ₹300 coupon AUDIO300)',
          '42dB adaptive ANC + LDAC Hi-Res wireless + 55h battery',
          'Available for instant pickup at local Croma megastores'
        ],
        recommendedProducts: matches,
        mapsGroundingLinks: [
          {
            title: 'Croma Megastore — Audio Demo Kiosks',
            uri: 'https://maps.google.com/?q=Croma+electronics+store+near+me'
          }
        ],
        suggestedFilter: {
          label: 'Filter Canvas: Audio under ₹5,000',
          category: 'Audio',
          maxPrice: 5000
        },
        couponCallout: {
          code: 'AUDIO300',
          description: 'Extra ₹300 off on Soundcore Space One Pro',
          discountINR: 300
        }
      };
    } else if (lower.includes('compare') || lower.includes('sony') || lower.includes('vs')) {
      const audioPicks = PRODUCTS.filter((p) => p.category === 'Audio');
      aiResponse = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        timestamp: 'Just now',
        text: 'Comparing Soundcore Space One Pro (₹4,499) vs Sony ULT WEAR (₹12,990): Soundcore wins on pure value-per-rupee (99/100) and battery endurance (55h vs 30h). Sony wins on ultra-low frequency aircraft cabin cancellation and official Sony Center presence across India.',
        highlights: [
          'Save ₹8,491 by choosing Soundcore Space One Pro for daily WFH & metro travel',
          'Visit an authorized Sony Center on Google Maps to audition the ULT bass toggle'
        ],
        recommendedProducts: audioPicks,
        mapsGroundingLinks: [
          {
            title: 'Sony Center Authorized Lounge on Google Maps',
            uri: 'https://maps.google.com/?q=Sony+Center+authorized+store+near+me'
          }
        ]
      };
    } else if (
      lower.includes('chair') ||
      lower.includes('ergonomic') ||
      lower.includes('wfh') ||
      lower.includes('desk') ||
      lower.includes('keyboard')
    ) {
      const deskPicks = PRODUCTS.filter(
        (p) => p.category === 'Ergonomics' || p.category === 'Keyboards & Desk'
      );
      aiResponse = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        timestamp: 'Just now',
        text: 'For long 10+ hour WFH coding sessions, I recommend pairing the Featherlite Liberate Dynamic Lumbar Chair (₹16,499) with the AULA F75 Gasket Mechanical Keyboard (₹4,899) or Keychron Q1 Pro (₹11,499). You can visit Featherlite furniture experience centers in Bengaluru, Mumbai, and Delhi to test ergonomics.',
        highlights: [
          'Featherlite Liberate includes free 48h doorstep assembly & 3-year warranty',
          'Featherlite experience centers available on Google Maps for posture trial'
        ],
        recommendedProducts: deskPicks.slice(0, 3),
        mapsGroundingLinks: [
          {
            title: 'Featherlite Furniture Experience Centers on Google Maps',
            uri: 'https://maps.google.com/?q=Featherlite+furniture+showroom+near+me'
          }
        ],
        suggestedFilter: {
          label: 'Show Keyboards & Desk Setup',
          category: 'Keyboards & Desk'
        }
      };
    } else {
      const keywordMatches = PRODUCTS.filter(
        (p) =>
          p.title.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          p.brand.toLowerCase().includes(lower)
      );
      const recs = keywordMatches.length > 0 ? keywordMatches : PRODUCTS.slice(0, 2);
      aiResponse = {
        id: `ai-${Date.now() + 1}`,
        sender: 'ai',
        timestamp: 'Just now',
        text: `Based on your query "${q}", I cross-checked 90-day Indian retail pricing, verified durability ratings, and authorized physical retailer availability on Google Maps:`,
        highlights: recs.map(
          (r) => `${r.brand} (${formatINR(r.price)}) — ${r.matchScore}% Match · ${r.quickSpecs[0]}`
        ),
        recommendedProducts: recs.slice(0, 2),
        mapsGroundingLinks: [
          {
            title: `Google Maps Authorized Showrooms: ${q}`,
            uri: `https://maps.google.com/?q=${encodeURIComponent(q + ' store near me')}`
          }
        ]
      };
    }

    setMessages((prev) => [...prev, aiResponse]);
  };

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    handleSendCopilotQuery(searchQuery);
  };

  const handleVoiceSearchTrigger = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setIsVoiceListening(false);
      const sampleVoiceQuery = 'Find authorized electronics stores near Indiranagar on Google Maps';
      setSearchQuery(sampleVoiceQuery);
      handleSendCopilotQuery(sampleVoiceQuery);
    }, 1100);
  };

  const handleSelectPromptSuggestion = (suggestionId: string) => {
    const found = AI_PROMPT_SUGGESTIONS.find((s) => s.id === suggestionId);
    if (!found) return;
    setActivePromptId(found.id);
    setActiveTab('discover');
    setSelectedCategory(found.targetCategory);
    setMaxPriceFilter(found.maxPrice ?? null);
    setOnly90dLow(found.id === 'lowest-90d-deals');
    setSearchQuery('');
    handleSendCopilotQuery(found.query);
  };

  const handleAskCopilotAboutProduct = (product: Product) => {
    setIsCopilotOpen(true);
    setIsMobileCopilotOpen(true);
    handleSendCopilotQuery(
      `Should I buy the ${product.brand} ${product.title.split(' ').slice(0, 3).join(' ')} at ${formatINR(product.price)}? Also find authorized stores near me on Google Maps.`
    );
  };

  const handleClearAllFilters = () => {
    setSelectedCategory('All');
    setMaxPriceFilter(null);
    setOnly90dLow(false);
    setOnlyHighMatch(false);
    setSearchQuery('');
    setActivePromptId(null);
  };

  const totalBagCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalBagAmount = cartItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A]">
      {/* Top Navigation Bar — Strict 3-Zone Contract */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-[64px] flex items-center justify-between gap-4">
          {/* Zone 1: Single Text Element Wordmark */}
          <a
            href="#discover"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('discover');
            }}
            className="font-display text-[20px] font-extrabold tracking-[-0.02em] text-[#0F172A] whitespace-nowrap shrink-0"
          >
            ShopMate AI
          </a>

          {/* Zone 2: 4 Clean Single-Line Text Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#334155]">
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'discover'
                  ? 'border-[#6366F1] text-[#0F172A] font-semibold'
                  : 'border-transparent hover:text-[#0F172A] hover:border-[#CBD5E1]'
              }`}
            >
              Discover
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 price-tabular ${
                activeTab === 'compare'
                  ? 'border-[#6366F1] text-[#0F172A] font-semibold'
                  : 'border-transparent hover:text-[#0F172A] hover:border-[#CBD5E1]'
              }`}
            >
              Compare ({compareIds.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('price-drops')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'price-drops'
                  ? 'border-[#6366F1] text-[#0F172A] font-semibold'
                  : 'border-transparent hover:text-[#0F172A] hover:border-[#CBD5E1]'
              }`}
            >
              90-Day Price Drops
            </button>
            <button
              type="button"
              onClick={() => handleOpenNearbyStores()}
              className="py-1 transition-colors whitespace-nowrap text-[#059669] hover:text-[#047857] flex items-center gap-1 font-semibold"
            >
              <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Google Maps Stores</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('saved')}
              className={`py-1 transition-colors whitespace-nowrap border-b-2 price-tabular ${
                activeTab === 'saved'
                  ? 'border-[#6366F1] text-[#0F172A] font-semibold'
                  : 'border-transparent hover:text-[#0F172A] hover:border-[#CBD5E1]'
              }`}
            >
              Saved ({wishlistIds.length})
            </button>
          </nav>

          {/* Zone 3: Primary Actions (Live Voice, Copilot Toggle & Shopping Bag) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsLiveVoiceModalOpen(true)}
              title="Start real-time duplex voice conversation with gemini-3.8-live"
              className="h-[40px] px-3.5 rounded-full bg-gradient-to-r from-[#6366F1] to-[#7C3AED] hover:from-[#4F46E5] hover:to-[#6D28D9] text-white font-display text-[12px] font-semibold flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Live Voice</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenNearbyStores()}
              title="Find authorized stores on Google Maps"
              className="h-[40px] px-3 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#10B981]/30 text-[#059669] font-display text-[12px] font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <MapPin className="w-4 h-4 text-[#10B981]" />
              <span className="hidden sm:inline">Google Maps Stores</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsCopilotOpen(!isCopilotOpen);
                setIsMobileCopilotOpen(!isMobileCopilotOpen);
              }}
              className={`h-[40px] px-3.5 rounded-full font-display text-[13px] font-semibold flex items-center gap-2 border transition-colors whitespace-nowrap ${
                isCopilotOpen
                  ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                  : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              {isCopilotOpen ? (
                <PanelRightClose className="w-4 h-4 hidden lg:block" />
              ) : (
                <PanelRightOpen className="w-4 h-4 hidden lg:block" />
              )}
              <Sparkles className="w-3.5 h-3.5 text-[#6366F1] lg:hidden" />
              <span>AI Copilot</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="h-[40px] px-4 rounded-full btn-primary-pill text-[13px] flex items-center gap-2 whitespace-nowrap price-tabular"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Bag ({totalBagCount})</span>
              <span className="hidden sm:inline opacity-90">· {formatINR(totalBagAmount)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Search & AI Conversational Dock Section */}
      <section className="bg-gradient-to-b from-white via-[#F8FAFC] to-[#F8FAFC] border-b border-[#E2E8F0]/80 pt-6 pb-6">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-2.5 mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#10B981]/30 text-[#059669] font-display text-[12px] font-semibold">
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Maps Store Grounding + 90-Day India Price Tracking</span>
            </div>
            <h1
              className="font-display text-[28px] md:text-[36px] font-bold leading-[36px] md:leading-[44px] tracking-[-0.02em] text-[#0F172A]"
              style={{ textWrap: 'balance' }}
            >
              Shop smarter with transparent AI reasoning & Google Maps store discovery
            </h1>
            <p className="text-[14px] md:text-[15px] text-[#334155] font-body max-w-2xl mx-auto">
              Ask in plain language. Compare 90-day prices online or use Google Maps to find verified local showrooms where you can try products in person today.
            </p>
          </div>

          {/* AI Search & Conversational Input Bar — Height 56px, pill-shaped, halo shadow */}
          <form
            onSubmit={handleHeroSearchSubmit}
            className="max-w-[780px] mx-auto h-[56px] rounded-full bg-white border border-[#6366F1]/25 px-4 flex items-center gap-3 transition-shadow focus-within:border-[#6366F1]"
            style={{
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.12)'
            }}
          >
            {/* Left Slot: Shimmering Violet AI Spark Icon */}
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)'
              }}
            >
              <Sparkles className="w-4 h-4" />
            </div>

            {/* Center Slot: Conversational Search Input */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isVoiceListening
                  ? 'Listening for voice search... Ask for headphones, keyboards, or stores on Google Maps...'
                  : 'Ask ShopMate: e.g., Find authorized Sony or Croma stores near me on Google Maps...'
              }
              className="flex-1 bg-transparent text-[14px] md:text-[15px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none min-w-0 font-body"
            />

            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search query"
                className="p-1.5 text-[#64748B] hover:text-[#0F172A]"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Right Slot: Action Cluster with Voice Search & Circular Send Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsLiveVoiceModalOpen(true)}
                title="Start real-time voice conversation with gemini-3.8-live"
                aria-label="Start Live Voice conversation"
                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors border bg-[#EEF2FF] hover:bg-[#E0E7FF] border-[#6366F1]/30 text-[#4F46E5] hover:text-[#4338CA]"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                type="submit"
                aria-label="Ask ShopMate"
                className="w-10 h-10 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white flex items-center justify-center shadow-xs transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* AI Prompt Suggestion Chips */}
          <div className="max-w-[840px] mx-auto mt-4 flex items-center justify-start md:justify-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => handleOpenNearbyStores()}
              className="h-[32px] px-3.5 rounded-full font-display text-[12px] font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all border bg-[#ECFDF5] hover:bg-[#D1FAE5] border-[#10B981]/30 text-[#059669]"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Find Authorized Stores (Google Maps)</span>
            </button>
            {AI_PROMPT_SUGGESTIONS.map((item) => {
              const isSelected = activePromptId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPromptSuggestion(item.id)}
                  className={`h-[32px] px-3.5 rounded-full font-display text-[12px] font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all border ${
                    isSelected
                      ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5] shadow-2xs'
                      : 'bg-[#6366F1]/[0.06] hover:bg-[#6366F1]/[0.12] border-[#6366F1]/24 text-[#334155] hover:text-[#4F46E5]'
                  }`}
                >
                  <span className="text-[#6366F1]" aria-hidden="true">
                    ✦
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mobile Navigation Tabs */}
      <div className="md:hidden bg-white border-b border-[#E2E8F0] px-4 py-2 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'discover' as const, label: 'Discover' },
          { id: 'compare' as const, label: `Compare (${compareIds.length})` },
          { id: 'price-drops' as const, label: '90d Price Drops' },
          { id: 'saved' as const, label: `Saved (${wishlistIds.length})` }
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`h-[32px] px-3 rounded-full font-display text-[12px] font-semibold whitespace-nowrap border ${
              activeTab === t.id
                ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                : 'bg-white border-[#E2E8F0] text-[#334155]'
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => handleOpenNearbyStores()}
          className="h-[32px] px-3 rounded-full font-display text-[12px] font-semibold whitespace-nowrap bg-[#ECFDF5] border border-[#10B981]/30 text-[#059669] flex items-center gap-1"
        >
          <MapPin className="w-3 h-3" />
          <span>Maps Stores</span>
        </button>
      </div>

      {/* Main 1200px Container with 840px Catalog Canvas + 360px AI Copilot Rail */}
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row items-start gap-[24px]">
          {/* Left / Main Content Canvas (840px on Desktop when Copilot is open) */}
          <div className="w-full flex-1 min-w-0 space-y-6">
            {activeTab === 'compare' ? (
              <CompareView
                compareIds={compareIds}
                onToggleCompare={handleToggleCompare}
                onSelectProduct={setSelectedProduct}
                onAddToCart={handleAddToCart}
                onSwitchToDiscover={() => setActiveTab('discover')}
                onOpenNearbyStores={handleOpenNearbyStores}
              />
            ) : (
              <>
                {/* Luminescent AI Recommendation Synthesis Block */}
                <div className="luminescent-ai-block rounded-[16px] p-4 md:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-flex items-center gap-1 h-[24px] px-2.5 rounded-full text-[11px] font-semibold text-white font-display"
                        style={{
                          background: 'linear-gradient(135deg, #6366F1 0%, #7C3AED 100%)'
                        }}
                      >
                        ✦ AI Synthesis
                      </span>
                      <h2 className="font-display text-[16px] font-bold text-[#0F172A]">
                        {activeSynthesis.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenNearbyStores()}
                        className="h-[32px] px-3 rounded-full bg-[#ECFDF5] hover:bg-[#D1FAE5] border border-[#10B981]/30 text-[#059669] font-display text-[12px] font-semibold inline-flex items-center gap-1 transition-colors"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Nearby Stores</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('compare')}
                        className="h-[32px] px-3 rounded-full bg-white hover:bg-[#EEF2FF] border border-[#6366F1]/30 text-[#4F46E5] font-display text-[12px] font-semibold inline-flex items-center gap-1.5 self-start sm:self-auto whitespace-nowrap transition-colors price-tabular"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Compare ({compareIds.length})</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-[13px] md:text-[14px] leading-[21px] text-[#334155] font-body">
                    {activeSynthesis.body}
                  </p>

                  {/* Price Drops Tab Extra Coupon Bar */}
                  {activeTab === 'price-drops' && (
                    <div className="mt-3 pt-3 border-t border-[#C7D2FE]/70 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[12px] text-[#059669] font-semibold font-display">
                        <TrendingDown className="w-4 h-4" />
                        <span>
                          All items below are verified at their 90-day lowest price in ₹
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {['AUDIO300', 'BREW1000', 'WFH1000'].map((code) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => {
                              navigator.clipboard?.writeText(code).catch(() => {});
                              setCopiedCoupon(code);
                              setTimeout(() => setCopiedCoupon(null), 1500);
                            }}
                            className="h-[26px] px-2.5 rounded-full bg-[#ECFDF5] border border-[#10B981]/30 text-[#059669] font-display text-[11px] font-semibold inline-flex items-center gap-1"
                          >
                            <Tag className="w-3 h-3" />
                            <span>{copiedCoupon === code ? `${code} Copied ✓` : code}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filter & Sort Controls Row */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Category Filter Chips (Height 32px, pill-shaped, selected #EEF2FF / #6366F1) */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {CATEGORIES.map((category) => {
                        const isSelected = selectedCategory === category;
                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(
                                isSelected && category !== 'All' ? 'All' : category
                              );
                              setActivePromptId(null);
                            }}
                            className={`h-[32px] px-3.5 rounded-full font-display text-[12px] font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors border ${
                              isSelected
                                ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                                : 'bg-white hover:bg-[#F8FAFC] border-[#E2E8F0] text-[#334155]'
                            }`}
                          >
                            <span>{category}</span>
                            {isSelected && category !== 'All' && (
                              <X className="w-3 h-3 text-[#4F46E5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {/* Sort Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <SlidersHorizontal className="w-3.5 h-3.5 text-[#64748B]" />
                      <label htmlFor="sort-select" className="text-[12px] text-[#64748B]">
                        Sort:
                      </label>
                      <select
                        id="sort-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="h-[32px] px-2.5 rounded-lg bg-white border border-[#E2E8F0] text-[12px] font-semibold font-display text-[#0F172A] focus:outline-none focus:border-[#6366F1]"
                      >
                        <option value="match">Highest AI Match %</option>
                        <option value="price-asc">Price: Low to High (₹)</option>
                        <option value="discount">Biggest Savings %</option>
                        <option value="rating">Customer Rating ★</option>
                      </select>
                    </div>
                  </div>

                  {/* Secondary Smart Filter Pills (Budget Ceiling, 90d Low, >=95% Match) */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setMaxPriceFilter(maxPriceFilter === 5000 ? null : 5000)
                        }
                        className={`h-[28px] px-3 rounded-full font-display text-[11px] font-semibold flex items-center gap-1 border price-tabular transition-colors ${
                          maxPriceFilter === 5000
                            ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                            : 'bg-white border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <span>Under ₹5,000</span>
                        {maxPriceFilter === 5000 && <X className="w-3 h-3" />}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setMaxPriceFilter(maxPriceFilter === 15000 ? null : 15000)
                        }
                        className={`h-[28px] px-3 rounded-full font-display text-[11px] font-semibold flex items-center gap-1 border price-tabular transition-colors ${
                          maxPriceFilter === 15000
                            ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                            : 'bg-white border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <span>Under ₹15,000</span>
                        {maxPriceFilter === 15000 && <X className="w-3 h-3" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOnly90dLow(!only90dLow)}
                        className={`h-[28px] px-3 rounded-full font-display text-[11px] font-semibold flex items-center gap-1 border transition-colors ${
                          only90dLow
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#059669]'
                            : 'bg-white border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <TrendingDown className="w-3 h-3" />
                        <span>90-Day Lowest Price</span>
                        {only90dLow && <X className="w-3 h-3" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setOnlyHighMatch(!onlyHighMatch)}
                        className={`h-[28px] px-3 rounded-full font-display text-[11px] font-semibold flex items-center gap-1 border price-tabular transition-colors ${
                          onlyHighMatch
                            ? 'bg-[#ECFDF5] border-[#10B981] text-[#059669]'
                            : 'bg-white border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]'
                        }`}
                      >
                        <Check className="w-3 h-3" />
                        <span>≥95% AI Match</span>
                        {onlyHighMatch && <X className="w-3 h-3" />}
                      </button>

                      {(selectedCategory !== 'All' ||
                        maxPriceFilter !== null ||
                        only90dLow ||
                        onlyHighMatch ||
                        searchQuery.trim() !== '') && (
                        <button
                          type="button"
                          onClick={handleClearAllFilters}
                          className="h-[28px] px-2.5 text-[11px] font-semibold font-display text-[#6366F1] hover:text-[#4F46E5] inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Filters</span>
                        </button>
                      )}
                    </div>

                    <div className="text-[12px] text-[#64748B] price-tabular">
                      Showing <strong className="text-[#0F172A]">{filteredProducts.length}</strong> of{' '}
                      {PRODUCTS.length} verified products
                    </div>
                  </div>
                </div>

                {/* Product Catalog Grid */}
                {filteredProducts.length === 0 ? (
                  <div className="rounded-[16px] bg-white border border-[#E2E8F0] p-12 text-center space-y-3">
                    <p className="font-display text-[16px] font-semibold text-[#0F172A]">
                      No products match your exact filter combination
                    </p>
                    <p className="text-[13px] text-[#64748B] max-w-md mx-auto">
                      Try raising the budget cap or clearing active filters so ShopMate AI can surface the closest high-match alternatives.
                    </p>
                    <button
                      type="button"
                      onClick={handleClearAllFilters}
                      className="h-[40px] px-5 rounded-full btn-primary-pill text-[13px]"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-1 md:grid-cols-2 ${
                      isCopilotOpen ? 'xl:grid-cols-2' : 'xl:grid-cols-3'
                    } gap-[24px]`}
                  >
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isWishlisted={wishlistIds.includes(product.id)}
                        isCompared={compareIds.includes(product.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onToggleCompare={handleToggleCompare}
                        onSelectProduct={setSelectedProduct}
                        onAddToCart={handleAddToCart}
                        onAskCopilot={handleAskCopilotAboutProduct}
                        onOpenNearbyStores={handleOpenNearbyStores}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right Rail: Persistent or Collapsible 360px AI Conversational Copilot Rail (Desktop) */}
          {isCopilotOpen && (
            <div className="hidden lg:block w-[360px] shrink-0">
              <AiCopilotRail
                messages={messages}
                onSendMessage={handleSendCopilotQuery}
                onSelectProduct={setSelectedProduct}
                onToggleCompare={handleToggleCompare}
                compareIds={compareIds}
                onApplyFilter={(category, maxP) => {
                  setActiveTab('discover');
                  if (category) setSelectedCategory(category);
                  setMaxPriceFilter(maxP ?? null);
                }}
                onResetConversation={() => setMessages(INITIAL_MESSAGES)}
                onOpenNearbyStores={handleOpenNearbyStores}
                onOpenLiveVoice={() => setIsLiveVoiceModalOpen(true)}
              />
            </div>
          )}
        </div>
      </main>

      {/* Mobile / Tablet Copilot Drawer */}
      {isMobileCopilotOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden bg-[#0F172A]/45 backdrop-blur-xs flex justify-end p-3"
          onClick={() => setIsMobileCopilotOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[380px] h-full flex flex-col"
          >
            <AiCopilotRail
              messages={messages}
              onSendMessage={handleSendCopilotQuery}
              onSelectProduct={(p) => {
                setIsMobileCopilotOpen(false);
                setSelectedProduct(p);
              }}
              onToggleCompare={handleToggleCompare}
              compareIds={compareIds}
              onApplyFilter={(category, maxP) => {
                setActiveTab('discover');
                if (category) setSelectedCategory(category);
                setMaxPriceFilter(maxP ?? null);
                setIsMobileCopilotOpen(false);
              }}
              onResetConversation={() => setMessages(INITIAL_MESSAGES)}
              onCloseMobile={() => setIsMobileCopilotOpen(false)}
              onOpenNearbyStores={handleOpenNearbyStores}
              onOpenLiveVoice={() => setIsLiveVoiceModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* Floating Comparison Bar when >= 2 items are selected and user is on Discover tab */}
      {activeTab !== 'compare' && compareIds.length >= 2 && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20 max-w-[92vw] rounded-full bg-[#0F172A] text-white px-4 py-2.5 shadow-xl border border-white/10 flex items-center gap-3">
          <span className="text-[12px] font-display font-semibold whitespace-nowrap price-tabular">
            {compareIds.length} products ready to compare
          </span>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className="h-[30px] px-3.5 rounded-full bg-[#6366F1] hover:bg-[#4F46E5] text-white font-display text-[12px] font-semibold whitespace-nowrap transition-colors"
          >
            Compare Side-by-Side →
          </button>
        </div>
      )}

      {/* Clean Editorial Footer */}
      <footer className="mt-12 bg-white border-t border-[#E2E8F0] py-8">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#64748B]">
          <div>
            <span className="font-display font-bold text-[#0F172A]">ShopMate AI</span> · Personal Shopping Companion, 90-Day Price Tracking & Google Maps Store Grounding
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab('discover')}
              className="hover:text-[#0F172A] transition-colors"
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className="hover:text-[#0F172A] transition-colors"
            >
              Comparison Matrix
            </button>
            <button
              type="button"
              onClick={() => handleOpenNearbyStores()}
              className="hover:text-[#059669] text-[#059669] font-medium transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Google Maps Stores</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="hover:text-[#0F172A] transition-colors"
            >
              Shopping Bag
            </button>
          </div>
        </div>
      </footer>

      {/* Product Detail & 90-Day Price History Modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isWishlisted={
          selectedProduct ? wishlistIds.includes(selectedProduct.id) : false
        }
        isCompared={
          selectedProduct ? compareIds.includes(selectedProduct.id) : false
        }
        onToggleWishlist={handleToggleWishlist}
        onToggleCompare={handleToggleCompare}
        onAddToCart={handleAddToCart}
        onAskCopilot={handleAskCopilotAboutProduct}
        onOpenNearbyStores={handleOpenNearbyStores}
      />

      {/* Google Maps Grounded Nearby Stores Modal */}
      <NearbyStoresModal
        product={mapsModalProduct}
        isOpen={isMapsModalOpen}
        onClose={() => {
          setIsMapsModalOpen(false);
          setMapsModalProduct(null);
        }}
      />

      {/* Live Voice Conversation Modal (gemini-3.8-live) */}
      <LiveVoiceModal
        isOpen={isLiveVoiceModalOpen}
        onClose={() => setIsLiveVoiceModalOpen(false)}
        onOpenNearbyStores={() => {
          setIsLiveVoiceModalOpen(false);
          setIsMapsModalOpen(true);
        }}
      />

      {/* Slide-Over Shopping Bag & Express Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
      />
    </div>
  );
}

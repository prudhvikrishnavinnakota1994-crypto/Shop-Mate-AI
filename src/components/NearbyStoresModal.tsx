import React, { useState, useEffect } from 'react';
import {
  MapPin,
  X,
  Navigation,
  ExternalLink,
  Store,
  Clock,
  Star,
  Search,
  Loader2,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import { Product } from '../data/products';

interface GroundingLink {
  title: string;
  uri: string;
  snippets?: string[];
}

interface NearbyPlace {
  title: string;
  uri: string;
  address?: string;
  rating?: number;
  distance?: string;
  status?: string;
  snippets?: string[];
}

interface NearbyStoresModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

const METRO_CITIES = [
  { name: 'Bengaluru (Indiranagar / Koramangala)', lat: 12.9716, lng: 77.5946 },
  { name: 'Mumbai (Bandra / Lower Parel)', lat: 19.076, lng: 72.8777 },
  { name: 'Delhi NCR (Connaught Place / Gurgaon)', lat: 28.6139, lng: 77.209 },
  { name: 'Hyderabad (Hitec City / Jubilee Hills)', lat: 17.385, lng: 78.4867 }
];

export const NearbyStoresModal: React.FC<NearbyStoresModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(METRO_CITIES[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [customSearch, setCustomSearch] = useState('');
  const [aiAnalysisText, setAiAnalysisText] = useState('');
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [extractedLinks, setExtractedLinks] = useState<GroundingLink[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<NearbyPlace | null>(null);

  // Detect user geolocation if allowed
  useEffect(() => {
    if (isOpen && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          // fallback to city coordinates
        },
        { timeout: 5000 }
      );
    }
  }, [isOpen]);

  const fetchStoresWithMapsGrounding = async (queryOverride?: string) => {
    setLoading(true);
    try {
      const activeLat = userLocation?.lat || selectedCity.lat;
      const activeLng = userLocation?.lng || selectedCity.lng;

      const q =
        queryOverride ||
        (product
          ? `Find authorized retail stores, showrooms, and electronics outlets near me where I can inspect, test demo units, or buy ${product.brand} ${product.title} in ${selectedCity.name}.`
          : `Find top-rated electronics megastores, Croma, Reliance Digital, and authorized computer showrooms near ${selectedCity.name}.`);

      const res = await fetch('/api/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          lat: activeLat,
          lng: activeLng,
          productTitle: product?.title,
          brand: product?.brand,
          category: product?.category
        })
      });

      const data = await res.json();
      if (data.success) {
        setAiAnalysisText(data.text || '');
        setPlaces(data.places || []);
        setExtractedLinks(data.extractedLinks || []);
        if (data.places && data.places.length > 0) {
          setSelectedPlace(data.places[0]);
        }
      }
    } catch (err) {
      console.error('Failed to query maps grounding:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStoresWithMapsGrounding();
    }
  }, [isOpen, product, selectedCity]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F172A]/50 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[960px] max-h-[92vh] overflow-y-auto rounded-[16px] bg-white border border-[#6366F1]/30 elevation-3-ai p-5 md:p-7 space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#ECFDF5] border border-[#10B981]/30 text-[#059669] flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-[17px] font-bold text-[#0F172A]">
                  Google Maps Store Grounding
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-[#EEF2FF] border border-[#6366F1]/30 text-[#4F46E5] font-display text-[10px] font-semibold">
                  gemini-3.5-flash + googleMaps
                </span>
              </div>
              <p className="text-[12px] text-[#64748B]">
                {product
                  ? `Locate authorized retail display kiosks & immediate pickup for ${product.brand}`
                  : 'Find authorized tech showrooms, demo centers, and pickup points nearby'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Maps Modal"
            className="w-8 h-8 rounded-full bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#334155]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Location Selector & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5">
          <div className="w-full sm:w-auto flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {METRO_CITIES.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => {
                  setSelectedCity(city);
                }}
                className={`h-[32px] px-3 rounded-full text-[11px] font-semibold font-display whitespace-nowrap transition-colors border ${
                  selectedCity.name === city.name
                    ? 'bg-[#EEF2FF] border-[#6366F1] text-[#4F46E5]'
                    : 'bg-white border-[#E2E8F0] text-[#334155] hover:bg-[#F8FAFC]'
                }`}
              >
                {city.name.split(' ')[0]}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (customSearch.trim()) {
                fetchStoresWithMapsGrounding(customSearch.trim());
              }
            }}
            className="w-full sm:flex-1 flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={customSearch}
                onChange={(e) => setCustomSearch(e.target.value)}
                placeholder="Search specific store name, mall, or neighborhood..."
                className="w-full h-[36px] pl-8 pr-3 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-[12px] text-[#0F172A] placeholder:text-[#64748B] focus:outline-none focus:border-[#6366F1]"
              />
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="h-[36px] px-3.5 rounded-[10px] bg-[#6366F1] hover:bg-[#4F46E5] text-white text-[12px] font-semibold font-display flex items-center gap-1.5 transition-colors shrink-0"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Navigation className="w-3.5 h-3.5" />}
              <span>Search Maps</span>
            </button>
          </form>
        </div>

        {/* AI Maps Grounded Synthesis Callout */}
        <div className="luminescent-ai-block rounded-[12px] p-3.5 space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#4F46E5] font-display">
            <span>✦</span>
            <span>Google Maps Grounded AI Recommendation</span>
          </div>
          <p className="text-[12px] leading-[18px] text-[#334155]">
            {loading
              ? 'Querying Google Maps live place index and verified review snippets via gemini-3.5-flash...'
              : aiAnalysisText ||
                `Found authorized showrooms and verified retail centers near ${selectedCity.name}. Click any location to view instant directions, opening hours, and verified Google reviews.`}
          </p>
        </div>

        {/* 2-Column Layout: Store List + Maps Grounding Links */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Grounded Places List */}
          <div className="lg:col-span-7 space-y-3">
            <h3 className="font-display text-[13px] font-bold text-[#0F172A] flex items-center gap-1.5">
              <Store className="w-4 h-4 text-[#6366F1]" />
              <span>Nearby Stores with Live Google Maps Data</span>
            </h3>

            {loading ? (
              <div className="py-12 text-center space-y-2">
                <Loader2 className="w-7 h-7 text-[#6366F1] animate-spin mx-auto" />
                <p className="text-[13px] text-[#64748B]">
                  Grounding places with Google Maps...
                </p>
              </div>
            ) : places.length === 0 ? (
              <div className="p-8 text-center bg-[#F8FAFC] rounded-[12px] border border-[#E2E8F0] space-y-2">
                <p className="text-[13px] font-medium text-[#334155]">
                  No exact showroom matches found for this query
                </p>
                <p className="text-[12px] text-[#64748B]">
                  Try selecting a different metro city or search for general electronics outlets.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {places.map((place, idx) => {
                  const isSelected = selectedPlace?.title === place.title;
                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedPlace(place)}
                      className={`p-3.5 rounded-[12px] border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#EEF2FF]/60 border-[#6366F1] shadow-xs'
                          : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-display text-[13px] font-bold text-[#0F172A] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#EF4444] shrink-0" />
                          <span>{place.title}</span>
                        </div>
                        {place.rating && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FFFBEB] text-[#B45309] text-[11px] font-semibold price-tabular">
                            <Star className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                            {place.rating}
                          </span>
                        )}
                      </div>

                      {place.address && (
                        <p className="text-[11px] text-[#64748B] line-clamp-1 mb-1.5">
                          {place.address}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#334155] mb-2">
                        {place.distance && (
                          <span className="font-medium text-[#059669]">
                            {place.distance}
                          </span>
                        )}
                        {place.status && (
                          <span className="inline-flex items-center gap-1 text-[#64748B]">
                            <Clock className="w-3 h-3 text-[#10B981]" />
                            {place.status}
                          </span>
                        )}
                      </div>

                      {/* Snippets from place reviews */}
                      {place.snippets && place.snippets.length > 0 && (
                        <div className="text-[11px] text-[#475569] bg-[#F8FAFC] rounded-[8px] p-2 border border-[#E2E8F0] line-clamp-2 italic mb-2">
                          "{place.snippets[0]}"
                        </div>
                      )}

                      {/* Mandatory Google Maps Link */}
                      <div className="flex items-center justify-between pt-1 border-t border-[#F1F5F9]">
                        <span className="text-[10px] text-[#059669] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified Google Maps Location
                        </span>
                        <a
                          href={place.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4F46E5] hover:text-[#4338CA] hover:underline"
                        >
                          <span>Open in Google Maps</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column (5 cols): Mandatory Extracted Links & Selected Place Details */}
          <div className="lg:col-span-5 space-y-4">
            {/* Selected Store Card */}
            {selectedPlace && (
              <div className="rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#64748B] font-display uppercase tracking-wider">
                    Store Details
                  </span>
                  <a
                    href={selectedPlace.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-[28px] px-2.5 rounded-full bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-semibold font-display inline-flex items-center gap-1 transition-colors"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div>
                  <h4 className="font-display text-[14px] font-bold text-[#0F172A]">
                    {selectedPlace.title}
                  </h4>
                  {selectedPlace.address && (
                    <p className="text-[12px] text-[#64748B] mt-0.5">
                      {selectedPlace.address}
                    </p>
                  )}
                </div>

                <div className="p-3 bg-white rounded-[10px] border border-[#E2E8F0] text-[12px] text-[#334155] space-y-1">
                  <div className="font-semibold text-[#0F172A] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>In-Store Services</span>
                  </div>
                  <ul className="text-[11px] text-[#64748B] space-y-0.5 list-disc list-inside">
                    <li>Live product demonstration and acoustic testing</li>
                    <li>Instant counter collection with invoice and warranty stamp</li>
                    <li>Official brand service and return intake point</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Extracted Google Maps Links (Mandatory per Google Maps Grounding constitution) */}
            <div className="rounded-[14px] bg-white border border-[#E2E8F0] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-[12px] font-bold text-[#0F172A] flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-[#6366F1]" />
                  <span>Google Maps Grounding Sources</span>
                </h4>
                <span className="text-[10px] text-[#64748B] price-tabular">
                  {extractedLinks.length} Links
                </span>
              </div>
              <p className="text-[11px] text-[#64748B]">
                Direct Google Maps locations and verified review links extracted from Google Maps grounding data:
              </p>

              <div className="space-y-1.5 max-h-[160px] overflow-y-auto">
                {extractedLinks.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#F8FAFC] hover:bg-[#EEF2FF] border border-[#E2E8F0] hover:border-[#6366F1]/40 text-[11px] font-medium text-[#334155] hover:text-[#4F46E5] transition-colors"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#EF4444] shrink-0" />
                      <span className="truncate">{link.title}</span>
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#64748B] shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

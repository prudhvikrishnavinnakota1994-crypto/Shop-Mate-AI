import headphonesImg from '../assets/images/product_anc_headphones_1791449285126.jpg';
import keyboardImg from '../assets/images/product_mechanical_keyboard_1791449296528.jpg';
import smartwatchImg from '../assets/images/product_smartwatch_amoled_1791449307700.jpg';
import espressoImg from '../assets/images/product_espresso_maker_1791449317689.jpg';
import chairImg from '../assets/images/product_ergonomic_chair_1791449327312.jpg';

export type ProductCategory =
  | 'All'
  | 'Audio'
  | 'Keyboards & Desk'
  | 'Wearables'
  | 'Coffee & Home'
  | 'Ergonomics';

export interface StoreOffer {
  store: 'Amazon India' | 'Flipkart' | 'Croma' | 'Brand Direct';
  price: number;
  delivery: string;
  inStock: boolean;
  couponCode?: string;
  couponDiscount?: number;
  verifiedMinutesAgo: number;
}

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: Exclude<ProductCategory, 'All'>;
  image: string;
  imageFilterStyle?: string;
  price: number;
  mrp: number;
  discountPercent: number;
  rating: number;
  reviewCount: number;
  matchScore: number;
  isAiPick?: boolean;
  secondaryBadge?: 'Best Value' | 'Best Overall' | 'Lowest in 90d';
  quickSpecs: [string, string, string];
  aiReason: string;
  mapsSearchKeywords: string;
  aiDeepAnalysis: {
    verdictHeadline: string;
    buyerSentiment: string;
    idealFor: string;
    skipIf: string;
    pros: string[];
    cons: string[];
    scores: {
      valueForMoney: number;
      performance: number;
      buildQuality: number;
      afterSalesIndia: number;
    };
  };
  specs: {
    label: string;
    value: string;
  }[];
  storeOffers: StoreOffer[];
  priceHistory90d: {
    label: string;
    price: number;
  }[];
  lowest90d: number;
  average90d: number;
  highest90d: number;
  variants: {
    name: string;
    hex: string;
  }[];
}

export const formatINR = (amount: number): string => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

export const PRODUCTS: Product[] = [
  {
    id: 'aether-anc-pro',
    title: 'Soundcore Space One Pro Adaptive ANC Wireless Over-Ear Headphones',
    brand: 'Soundcore by Anker',
    category: 'Audio',
    image: headphonesImg,
    price: 4499,
    mrp: 7999,
    discountPercent: 44,
    rating: 4.8,
    reviewCount: 3420,
    matchScore: 98,
    isAiPick: true,
    secondaryBadge: 'Best Value',
    quickSpecs: ['42dB Adaptive ANC', '55h Battery', 'LDAC Hi-Res'],
    mapsSearchKeywords: 'Soundcore headphones Croma Reliance Digital authorized dealer',
    aiReason:
      'Outperforms ₹8,000+ rivals in low-frequency metro & cabin noise cancellation with 55-hour real-world battery life.',
    aiDeepAnalysis: {
      verdictHeadline: 'Unbeatable acoustic isolation under ₹5,000 with LDAC lossless audio.',
      buyerSentiment:
        '94% of 3,420 verified Indian buyers praise the plush memory-foam earcups during humid commutes and crystal-clear dual-mic Zoom calls.',
      idealFor: 'Daily commuters, remote engineers, and audiophiles under ₹5,000 budget.',
      skipIf: 'You need foldable pocket-sized gym earbuds with IPX7 water submersion.',
      pros: [
        'True 42dB adaptive noise cancellation blocks fan and traffic hum effortlessly',
        'Multipoint Bluetooth 5.3 switches seamlessly between MacBook and phone',
        '18-month doorstep warranty support across 45+ Indian metro cities'
      ],
      cons: [
        'Carry pouch included instead of a hard-shell zippered case',
        'LDAC mode reduces battery life from 55h to 38h'
      ],
      scores: {
        valueForMoney: 99,
        performance: 96,
        buildQuality: 94,
        afterSalesIndia: 95
      }
    },
    specs: [
      { label: 'Noise Cancellation', value: 'Adaptive 42dB Hybrid ANC (6 Mics)' },
      { label: 'Codec Support', value: 'LDAC, AAC, SBC (Hi-Res Wireless Certified)' },
      { label: 'Battery Life', value: '55 hrs (ANC Off) / 40 hrs (ANC On)' },
      { label: 'Fast Charge', value: '5 mins USB-C = 6 hrs playback' },
      { label: 'Weight', value: '258 g (Ergonomic memory protein leather)' },
      { label: 'Warranty', value: '18 Months Official India Warranty' }
    ],
    storeOffers: [
      {
        store: 'Amazon India',
        price: 4499,
        delivery: 'Free Tomorrow by 11 AM',
        inStock: true,
        couponCode: 'AUDIO300',
        couponDiscount: 300,
        verifiedMinutesAgo: 4
      },
      {
        store: 'Flipkart',
        price: 4699,
        delivery: 'Free 2-Day Delivery',
        inStock: true,
        verifiedMinutesAgo: 9
      },
      {
        store: 'Croma',
        price: 4999,
        delivery: 'Store Pickup Today',
        inStock: true,
        verifiedMinutesAgo: 14
      },
      {
        store: 'Brand Direct',
        price: 4599,
        delivery: '3–4 Business Days',
        inStock: true,
        couponCode: 'ANKERWELCOME',
        couponDiscount: 200,
        verifiedMinutesAgo: 18
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 6499 },
      { label: '75d ago', price: 5999 },
      { label: '60d ago', price: 5499 },
      { label: '45d ago', price: 5799 },
      { label: '30d ago', price: 4999 },
      { label: '15d ago', price: 4799 },
      { label: 'Today', price: 4499 }
    ],
    lowest90d: 4499,
    average90d: 5420,
    highest90d: 6499,
    variants: [
      { name: 'Midnight Slate', hex: '#1E293B' },
      { name: 'Titanium Silver', hex: '#CBD5E1' },
      { name: 'Cobalt Indigo', hex: '#4F46E5' }
    ]
  },
  {
    id: 'keychron-k2-pro-alu',
    title: 'Keychron Q1 Pro 75% QMK/VIA Wireless Custom Mechanical Keyboard',
    brand: 'Keychron',
    category: 'Keyboards & Desk',
    image: keyboardImg,
    price: 11499,
    mrp: 16999,
    discountPercent: 32,
    rating: 4.9,
    reviewCount: 1285,
    matchScore: 96,
    isAiPick: true,
    secondaryBadge: 'Best Overall',
    quickSpecs: ['CNC 6063 Aluminum', 'Hot-Swappable Tactile', 'QMK/VIA Wireless'],
    mapsSearchKeywords: 'Keychron authorized dealer gaming keyboard store computer peripheral shop',
    aiReason:
      'Full CNC machined aluminum body with double-gasket mount delivers deep acoustic thock right out of the box.',
    aiDeepAnalysis: {
      verdictHeadline: 'Enthusiast-grade custom typing feel with zero modding required.',
      buyerSentiment:
        '97% positive sentiment from software engineers and writers citing reduced finger fatigue and rock-solid macOS/Windows key remapping.',
      idealFor: 'Developers, product designers, and heavy typists seeking lifelong build quality.',
      skipIf: 'You travel frequently with your keyboard in a backpack (weighs 1.68 kg).',
      pros: [
        'Double-gasket mount with polycarbonate plate creates warm, muted acoustic profile',
        'Browser-based VIA macro and layer programming works without bloated background software',
        'Oil-resistant double-shot OSA profile PBT keycaps never develop shine'
      ],
      cons: [
        'Heavy CNC aluminum chassis (1,680g) is designed strictly for stationary desk setups',
        'South-facing RGB is subtle in bright daylight rooms'
      ],
      scores: {
        valueForMoney: 95,
        performance: 99,
        buildQuality: 99,
        afterSalesIndia: 92
      }
    },
    specs: [
      { label: 'Chassis Material', value: 'Full CNC Machined 6063 Anodized Aluminum' },
      { label: 'Switches', value: 'Keychron K Pro Tactile Banana (Pre-lubed, Hot-Swap)' },
      { label: 'Connectivity', value: 'Bluetooth 5.1 (3 Devices) + Wired USB Type-C' },
      { label: 'Battery Capacity', value: '4000 mAh Li-Po (Up to 100 hrs wireless)' },
      { label: 'Firmware', value: 'Open-Source QMK & Web VIA Configurator' },
      { label: 'Warranty', value: '1 Year Keychron India Authorized Warranty' }
    ],
    storeOffers: [
      {
        store: 'Brand Direct',
        price: 11499,
        delivery: 'Free BlueDart Air (2 Days)',
        inStock: true,
        couponCode: 'MECH500',
        couponDiscount: 500,
        verifiedMinutesAgo: 2
      },
      {
        store: 'Amazon India',
        price: 11999,
        delivery: 'Free Prime Tomorrow',
        inStock: true,
        verifiedMinutesAgo: 7
      },
      {
        store: 'Flipkart',
        price: 12490,
        delivery: '3 Days Standard',
        inStock: true,
        verifiedMinutesAgo: 15
      },
      {
        store: 'Croma',
        price: 12999,
        delivery: 'Online Order Only',
        inStock: false,
        verifiedMinutesAgo: 22
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 14999 },
      { label: '75d ago', price: 13999 },
      { label: '60d ago', price: 13499 },
      { label: '45d ago', price: 12999 },
      { label: '30d ago', price: 12499 },
      { label: '15d ago', price: 11999 },
      { label: 'Today', price: 11499 }
    ],
    lowest90d: 11499,
    average90d: 13150,
    highest90d: 14999,
    variants: [
      { name: 'Space Slate / Indigo', hex: '#334155' },
      { name: 'Shell White', hex: '#F1F5F9' },
      { name: 'Carbon Black', hex: '#0F172A' }
    ]
  },
  {
    id: 'apex-titanium-watch',
    title: 'Amazfit Balance Titanium Edition Dual-Band GPS AMOLED Smartwatch',
    brand: 'Amazfit',
    category: 'Wearables',
    image: smartwatchImg,
    price: 14999,
    mrp: 24999,
    discountPercent: 40,
    rating: 4.7,
    reviewCount: 2190,
    matchScore: 95,
    isAiPick: true,
    secondaryBadge: 'Lowest in 90d',
    quickSpecs: ['Sapphire Crystal', '14-Day Battery', 'Dual-Band L1+L5 GPS'],
    mapsSearchKeywords: 'Amazfit authorized showroom smartwatch store Croma Reliance Digital',
    aiReason:
      'Matches ₹40,000+ flagship watches in heart-rate & dual-band GPS accuracy while lasting a full 14 days per charge.',
    aiDeepAnalysis: {
      verdictHeadline: 'Medical-grade bio-tracking and sapphire durability without nightly charging.',
      buyerSentiment:
        'Runners and cyclists highlight the sub-2-meter GPS lock under dense tree cover and accurate HRV readiness recovery scores.',
      idealFor: 'Fitness enthusiasts, marathon runners, and iOS/Android users tired of 18-hour watch batteries.',
      skipIf: 'You require full third-party LTE eSIM standalone cellular calling.',
      pros: [
        '1,500-nit 1.5" AMOLED display remains effortlessly legible in harsh midday Indian sun',
        'BioTracker 5.0 PPG sensor achieves 98.4% correlation with chest-strap ECG monitors',
        'Supports offline turn-by-turn GPX route navigation and Bluetooth phone calls'
      ],
      cons: [
        '46mm dial may feel slightly large on wrists narrower than 150mm',
        'NFC tap-to-pay is limited to select international cards'
      ],
      scores: {
        valueForMoney: 97,
        performance: 95,
        buildQuality: 96,
        afterSalesIndia: 91
      }
    },
    specs: [
      { label: 'Display', value: '1.5" 480×480 AMOLED (1500 Nits, Sapphire Glass)' },
      { label: 'Positioning', value: 'Circularly Polarized Dual-Band GPS (6 Satellite Systems)' },
      { label: 'Sensors', value: 'BioTracker 5.0 (HRV, SpO2, Body Composition, Skin Temp)' },
      { label: 'Battery Endurance', value: '14 Days Typical / 26 Hours Continuous Dual-Band GPS' },
      { label: 'Water Resistance', value: '5 ATM Swim-Proof (Up to 50m depth)' },
      { label: 'Warranty', value: '1 Year Doorstep Replacement Warranty' }
    ],
    storeOffers: [
      {
        store: 'Amazon India',
        price: 14999,
        delivery: 'Free Same-Day by 9 PM',
        inStock: true,
        couponCode: 'FIT750',
        couponDiscount: 750,
        verifiedMinutesAgo: 3
      },
      {
        store: 'Croma',
        price: 15499,
        delivery: 'Express Store Pickup',
        inStock: true,
        verifiedMinutesAgo: 11
      },
      {
        store: 'Flipkart',
        price: 15299,
        delivery: 'Free Tomorrow',
        inStock: true,
        verifiedMinutesAgo: 8
      },
      {
        store: 'Brand Direct',
        price: 15999,
        delivery: '3–5 Days Delivery',
        inStock: true,
        verifiedMinutesAgo: 25
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 18999 },
      { label: '75d ago', price: 17999 },
      { label: '60d ago', price: 17499 },
      { label: '45d ago', price: 16999 },
      { label: '30d ago', price: 16499 },
      { label: '15d ago', price: 15999 },
      { label: 'Today', price: 14999 }
    ],
    lowest90d: 14999,
    average90d: 16990,
    highest90d: 18999,
    variants: [
      { name: 'Titanium Slate', hex: '#475569' },
      { name: 'Sunset Mist Nylon', hex: '#94A3B8' }
    ]
  },
  {
    id: 'barista-pid-espresso',
    title: 'Budan Craft Barista Pro 15-Bar PID Thermoblock Espresso Machine',
    brand: 'Budan Coffee',
    category: 'Coffee & Home',
    image: espressoImg,
    price: 18499,
    mrp: 27999,
    discountPercent: 34,
    rating: 4.8,
    reviewCount: 840,
    matchScore: 94,
    isAiPick: false,
    secondaryBadge: 'Lowest in 90d',
    quickSpecs: ['PID Temp Control', '58mm Commercial Group', 'Dry Steam Wand'],
    mapsSearchKeywords: 'Specialty coffee equipment store Blue Tokai Budan coffee brewing gear showroom',
    aiReason:
      'Only machine under ₹20,000 featuring digital PID temperature stability (±1°C) and an authentic 58mm commercial portafilter.',
    aiDeepAnalysis: {
      verdictHeadline: 'Café-caliber microfoam and extraction consistency for specialty Indian arabica.',
      buyerSentiment:
        'Home baristas rave about the real-time extraction pressure gauge and the commercial 58mm basket compatibility.',
      idealFor: 'Specialty coffee lovers brewing Blue Tokai, Subko, or Corridor Seven beans at home.',
      skipIf: 'You want a single-button pod machine with zero manual tamping.',
      pros: [
        'Active PID controller keeps brew water at exact 93°C for balanced, non-bitter shots',
        'Italian ULKA 15-bar pump with low-pressure pre-infusion blooms grounds evenly',
        'Pan-India technician network for descaling and gasket servicing'
      ],
      cons: [
        'Requires a dedicated burr grinder for non-pressurized single-wall baskets',
        'Single thermoblock takes 25 seconds to transition from espresso to steam'
      ],
      scores: {
        valueForMoney: 96,
        performance: 94,
        buildQuality: 95,
        afterSalesIndia: 93
      }
    },
    specs: [
      { label: 'Heating System', value: 'Fast-Heat Thermoblock with Digital PID Controller' },
      { label: 'Portafilter Size', value: '58mm Commercial Stainless Steel (Dual & Single Wall)' },
      { label: 'Pump Pressure', value: '15-Bar Italian ULKA Pump with OPV Valve (9-Bar Brew)' },
      { label: 'Water Tank', value: '1.8L BPA-Free Detachable Reservoir' },
      { label: 'Body Construction', value: '304 Brushed Stainless Steel + Analog Pressure Gauge' },
      { label: 'Warranty', value: '1 Year On-Site India Service Warranty' }
    ],
    storeOffers: [
      {
        store: 'Amazon India',
        price: 18499,
        delivery: 'Free Scheduled Delivery',
        inStock: true,
        couponCode: 'BREW1000',
        couponDiscount: 1000,
        verifiedMinutesAgo: 6
      },
      {
        store: 'Brand Direct',
        price: 18999,
        delivery: 'Includes Free 58mm Tamper + Pitcher',
        inStock: true,
        couponCode: 'BARISTA500',
        couponDiscount: 500,
        verifiedMinutesAgo: 12
      },
      {
        store: 'Croma',
        price: 19499,
        delivery: '2-Day Home Delivery',
        inStock: true,
        verifiedMinutesAgo: 19
      },
      {
        store: 'Flipkart',
        price: 19299,
        delivery: '3-Day Standard',
        inStock: true,
        verifiedMinutesAgo: 16
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 22999 },
      { label: '75d ago', price: 21999 },
      { label: '60d ago', price: 21499 },
      { label: '45d ago', price: 20499 },
      { label: '30d ago', price: 19999 },
      { label: '15d ago', price: 19499 },
      { label: 'Today', price: 18499 }
    ],
    lowest90d: 18499,
    average90d: 20710,
    highest90d: 22999,
    variants: [
      { name: 'Brushed Steel', hex: '#CBD5E1' },
      { name: 'Matte Obsidian', hex: '#1E293B' }
    ]
  },
  {
    id: 'ergo-spine-pro-chair',
    title: 'Featherlite Liberate High-Back Dynamic Lumbar Mesh Ergonomic Chair',
    brand: 'Featherlite',
    category: 'Ergonomics',
    image: chairImg,
    price: 16499,
    mrp: 23500,
    discountPercent: 30,
    rating: 4.8,
    reviewCount: 1940,
    matchScore: 96,
    isAiPick: true,
    secondaryBadge: 'Best Overall',
    quickSpecs: ['Dynamic Split Lumbar', 'BIFMA Level-3 Certified', '4D Armrests'],
    mapsSearchKeywords: 'Featherlite furniture showroom ergonomic chair store office furniture',
    aiReason:
      'Engineered for 10+ hour Indian WFH sessions with breathable Korean elastomer mesh and self-adjusting sacral support.',
    aiDeepAnalysis: {
      verdictHeadline: 'Clinical lower-back relief with breathable mesh built for tropical summers.',
      buyerSentiment:
        'Over 1,900 verified long-hour coders and analysts report complete elimination of tailbone and L4-L5 lumbar stiffness within 2 weeks.',
      idealFor: 'Remote professionals working 8–12 hours daily who want zero seat heat buildup.',
      skipIf: 'You prefer plush leather executive recliners over structured posture support.',
      pros: [
        'Dynamic flexing backrest tracks spine micro-movements without manual knob tweaking',
        'Seat depth slider + 4-position synchro-tilt lock adapts to heights from 5\'2" to 6\'3"',
        'Free technician assembly at home + 3-year comprehensive Featherlite warranty'
      ],
      cons: [
        'Minimalist studio grey aesthetic only; no vibrant gaming colorways',
        'Headrest tilt tension is firm during the first week of break-in'
      ],
      scores: {
        valueForMoney: 96,
        performance: 97,
        buildQuality: 98,
        afterSalesIndia: 98
      }
    },
    specs: [
      { label: 'Backrest Material', value: 'High-Tensile Breathable Korean Elastomer Mesh' },
      { label: 'Lumbar System', value: 'Adaptive Dual-Zone Sacral & Lower-Back Support' },
      { label: 'Mechanism', value: 'Multi-Lock Synchro-Tilt with Seat Depth Slider (50mm)' },
      { label: 'Armrests & Base', value: '4D PU Soft-Pad Armrests + Die-Cast Aluminum 5-Star Base' },
      { label: 'Load Capacity', value: '135 kg (BIFMA & ANSI Certified Class-4 Gas Lift)' },
      { label: 'Warranty', value: '3 Years On-Site Manufacturer Warranty + Free Assembly' }
    ],
    storeOffers: [
      {
        store: 'Brand Direct',
        price: 16499,
        delivery: 'Free Technician Assembly in 48h',
        inStock: true,
        couponCode: 'WFH1000',
        couponDiscount: 1000,
        verifiedMinutesAgo: 5
      },
      {
        store: 'Amazon India',
        price: 16999,
        delivery: 'Free Scheduled Delivery',
        inStock: true,
        verifiedMinutesAgo: 10
      },
      {
        store: 'Flipkart',
        price: 17250,
        delivery: '3–4 Days Delivery',
        inStock: true,
        verifiedMinutesAgo: 14
      },
      {
        store: 'Croma',
        price: 17999,
        delivery: 'Home Delivery Only',
        inStock: true,
        verifiedMinutesAgo: 29
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 19999 },
      { label: '75d ago', price: 19499 },
      { label: '60d ago', price: 18500 },
      { label: '45d ago', price: 17999 },
      { label: '30d ago', price: 17499 },
      { label: '15d ago', price: 16999 },
      { label: 'Today', price: 16499 }
    ],
    lowest90d: 16499,
    average90d: 18140,
    highest90d: 19999,
    variants: [
      { name: 'Cool Slate Mesh', hex: '#64748B' },
      { name: 'Obsidian Black', hex: '#0F172A' }
    ]
  },
  {
    id: 'sony-ult-wear-anc',
    title: 'Sony ULT WEAR WH-ULT900N Wireless Noise Cancelling Headphones',
    brand: 'Sony',
    category: 'Audio',
    image: headphonesImg,
    imageFilterStyle: 'hue-rotate(15deg) contrast(1.04)',
    price: 12990,
    mrp: 16990,
    discountPercent: 24,
    rating: 4.7,
    reviewCount: 2810,
    matchScore: 93,
    isAiPick: false,
    secondaryBadge: 'Best Overall',
    quickSpecs: ['Sony V1 Processor', 'Dual Noise Sensor', '30h ANC + Hard Case'],
    mapsSearchKeywords: 'Sony Center authorized retail store Croma Reliance Digital',
    aiReason:
      'Shares the flagship Sony 1000XM5 Integrated Processor V1 for class-leading ANC and punchy customizable bass.',
    aiDeepAnalysis: {
      verdictHeadline: '90% of flagship XM5 noise cancellation at nearly half the street price.',
      buyerSentiment:
        'Users love the physical ULT bass toggle, instant wear-detection pause sensor, and foldable hard case for flight travel.',
      idealFor: 'Frequent flyers and bass-forward music listeners who want tier-1 Sony ANC.',
      skipIf: 'Your strict budget ceiling is ₹5,000 (choose the Soundcore Space One Pro instead).',
      pros: [
        'Flagship Sony V1 chip cancels aircraft cabin roar and office chatter remarkably well',
        'Includes collapsible hard-shell travel case and 3.5mm wired backup cable',
        'Sony Headphones Connect EQ lets you dial back bass for neutral studio tuning'
      ],
      cons: [
        'Costs ₹8,491 more than our budget AI Pick (Soundcore Space One Pro)',
        'Default out-of-the-box tuning is warm until adjusted in the Sony app'
      ],
      scores: {
        valueForMoney: 91,
        performance: 97,
        buildQuality: 95,
        afterSalesIndia: 97
      }
    },
    specs: [
      { label: 'ANC Processor', value: 'Sony Integrated Processor V1 + Dual Noise Sensor' },
      { label: 'Driver Unit', value: '40mm Custom Neodymium Dome Driver' },
      { label: 'Codec Support', value: 'LDAC, AAC, SBC + DSEE Upscaling' },
      { label: 'Battery Life', value: '30 hrs (ANC On) / 50 hrs (ANC Off)' },
      { label: 'Weight', value: '255 g (Foldable Swivel Design with Hard Case)' },
      { label: 'Warranty', value: '1 Year Sony India Authorized Service Center Warranty' }
    ],
    storeOffers: [
      {
        store: 'Croma',
        price: 12990,
        delivery: 'Free 3-Hour Express Delivery',
        inStock: true,
        couponCode: 'SONYBANK750',
        couponDiscount: 750,
        verifiedMinutesAgo: 5
      },
      {
        store: 'Amazon India',
        price: 13490,
        delivery: 'Free Prime Tomorrow',
        inStock: true,
        verifiedMinutesAgo: 8
      },
      {
        store: 'Flipkart',
        price: 13490,
        delivery: '2-Day Delivery',
        inStock: true,
        verifiedMinutesAgo: 12
      },
      {
        store: 'Brand Direct',
        price: 13990,
        delivery: '3–4 Days Delivery',
        inStock: true,
        verifiedMinutesAgo: 20
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 15990 },
      { label: '75d ago', price: 14990 },
      { label: '60d ago', price: 14990 },
      { label: '45d ago', price: 13990 },
      { label: '30d ago', price: 13990 },
      { label: '15d ago', price: 13490 },
      { label: 'Today', price: 12990 }
    ],
    lowest90d: 12990,
    average90d: 14330,
    highest90d: 15990,
    variants: [
      { name: 'Forest Gray', hex: '#475569' },
      { name: 'Off-White', hex: '#E2E8F0' },
      { name: 'Matte Black', hex: '#0F172A' }
    ]
  },
  {
    id: 'aula-f75-gasket',
    title: 'AULA F75 75% Tri-Mode Gasket Mechanical Keyboard (5-Layer Sound Dampening)',
    brand: 'AULA',
    category: 'Keyboards & Desk',
    image: keyboardImg,
    imageFilterStyle: 'hue-rotate(-18deg) brightness(1.03)',
    price: 4899,
    mrp: 7999,
    discountPercent: 39,
    rating: 4.8,
    reviewCount: 4120,
    matchScore: 97,
    isAiPick: true,
    secondaryBadge: 'Best Value',
    quickSpecs: ['5-Layer Poron Foam', '2.4GHz + BT + Wired', 'Pre-Lubed Reaper Switches'],
    mapsSearchKeywords: 'Gaming pc store mechanical keyboard retailers SP Road Bangalore Lamington Road Mumbai',
    aiReason:
      'Highest-rated budget mechanical keyboard in India under ₹5,000; delivers creamy factory-lubed acoustics and rotary volume knob.',
    aiDeepAnalysis: {
      verdictHeadline: 'Unrivaled creamy typing acoustics under ₹5,000 with tri-mode wireless.',
      buyerSentiment:
        '4,100+ Indian gamers and coders call the factory-lubed stabilizers and 5-layer IXPE/PET sound pad "shockingly good for the price".',
      idealFor: 'Anyone wanting a wireless mechanical keyboard under ₹5,000 with zero rattle.',
      skipIf: 'You strictly need macOS native QMK/VIA open-source firmware.',
      pros: [
        'Five layers of internal sound-absorbing silicone and Poron foam right from the factory',
        'Low-latency 1000Hz 2.4GHz wireless dongle + 3-device Bluetooth + USB-C wired',
        'Tactile knurled aluminum multi-function volume and media control knob'
      ],
      cons: [
        'High-density ABS/Polycarbonate shell instead of CNC aluminum',
        'Companion remapping utility runs on Windows only'
      ],
      scores: {
        valueForMoney: 99,
        performance: 96,
        buildQuality: 92,
        afterSalesIndia: 90
      }
    },
    specs: [
      { label: 'Mounting Style', value: 'Leaf-Spring Gasket Mount with Flex-Cut PC Plate' },
      { label: 'Switches', value: 'Leobog Reaper Linear (Factory Pre-Lubed, 45g Actuation)' },
      { label: 'Wireless Modes', value: '2.4GHz 1ms Dongle + Bluetooth 5.0 + Detachable USB-C' },
      { label: 'Battery Capacity', value: '4000 mAh Rechargeable Li-Ion' },
      { label: 'Keycaps', value: 'Double-Shot Cherry Profile PBT (Glacier / Slate)' },
      { label: 'Warranty', value: '1 Year Official India Distributor Warranty' }
    ],
    storeOffers: [
      {
        store: 'Amazon India',
        price: 4899,
        delivery: 'Free Prime Tomorrow',
        inStock: true,
        couponCode: 'DESK250',
        couponDiscount: 250,
        verifiedMinutesAgo: 3
      },
      {
        store: 'Flipkart',
        price: 4999,
        delivery: '2-Day Delivery',
        inStock: true,
        verifiedMinutesAgo: 11
      },
      {
        store: 'Brand Direct',
        price: 4899,
        delivery: '3 Days Express',
        inStock: true,
        verifiedMinutesAgo: 17
      },
      {
        store: 'Croma',
        price: 5299,
        delivery: 'Standard Shipping',
        inStock: true,
        verifiedMinutesAgo: 28
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 6299 },
      { label: '75d ago', price: 5999 },
      { label: '60d ago', price: 5799 },
      { label: '45d ago', price: 5499 },
      { label: '30d ago', price: 5299 },
      { label: '15d ago', price: 4999 },
      { label: 'Today', price: 4899 }
    ],
    lowest90d: 4899,
    average90d: 5540,
    highest90d: 6299,
    variants: [
      { name: 'Glacier Slate', hex: '#4F46E5' },
      { name: 'Cedar Cream', hex: '#E2E8F0' }
    ]
  },
  {
    id: 'oneplus-watch-2r',
    title: 'OnePlus Watch 2R WearOS 4 Dual-Engine Architecture AMOLED Smartwatch',
    brand: 'OnePlus',
    category: 'Wearables',
    image: smartwatchImg,
    imageFilterStyle: 'hue-rotate(160deg) contrast(1.02)',
    price: 11999,
    mrp: 17999,
    discountPercent: 33,
    rating: 4.6,
    reviewCount: 1650,
    matchScore: 92,
    isAiPick: false,
    secondaryBadge: 'Best Value',
    quickSpecs: ['Full Google WearOS 4', '100h Smart Mode', 'Snapdragon W5 + BES2700'],
    mapsSearchKeywords: 'OnePlus Experience Store authorized showroom Croma',
    aiReason:
      'Dual-chipset architecture solves WearOS battery anxiety—giving full Google Maps, GPay, and WhatsApp replies with 4-day battery.',
    aiDeepAnalysis: {
      verdictHeadline: 'True Google WearOS app ecosystem with 100 hours of real battery life.',
      buyerSentiment:
        'Android users praise the seamless WhatsApp voice-note replies, Google Maps wrist turn-by-turn view, and 10-minute VOOC fast charge.',
      idealFor: 'Android smartphone users who want full Play Store apps on their wrist under ₹12,000.',
      skipIf: 'You use an iPhone (WearOS 4 does not pair with iOS).',
      pros: [
        'Snapdragon W5 handles WearOS apps while BES2700 co-processor sips power in background',
        '32GB onboard storage for offline Spotify playlists and Google Maps tiles',
        'Full 100-hour battery life in Smart Mode; 60 minutes for 100% VOOC charge'
      ],
      cons: [
        'Incompatible with iOS devices',
        'No rotating crown navigation (uses dual physical push buttons)'
      ],
      scores: {
        valueForMoney: 95,
        performance: 94,
        buildQuality: 92,
        afterSalesIndia: 96
      }
    },
    specs: [
      { label: 'Processors', value: 'Snapdragon W5 Gen 1 + BES2700 Efficiency Co-Processor' },
      { label: 'Operating System', value: 'Google Wear OS 4 + RTOS Hybrid Engine' },
      { label: 'Memory & Storage', value: '2GB RAM + 32GB Internal Storage' },
      { label: 'Battery Life', value: 'Up to 100 Hours (Smart Mode) / 12 Days (Power Saver)' },
      { label: 'Connectivity', value: 'Dual-Frequency L1+L5 GPS, Wi-Fi, Bluetooth 5.0, NFC' },
      { label: 'Warranty', value: '1 Year OnePlus India Exclusive Service Center Warranty' }
    ],
    storeOffers: [
      {
        store: 'Amazon India',
        price: 11999,
        delivery: 'Free Prime Tomorrow',
        inStock: true,
        couponCode: 'ONEPLUS500',
        couponDiscount: 500,
        verifiedMinutesAgo: 4
      },
      {
        store: 'Croma',
        price: 11999,
        delivery: 'In-Store Pickup Available',
        inStock: true,
        verifiedMinutesAgo: 7
      },
      {
        store: 'Flipkart',
        price: 12299,
        delivery: 'Free 2-Day Delivery',
        inStock: true,
        verifiedMinutesAgo: 13
      },
      {
        store: 'Brand Direct',
        price: 11999,
        delivery: '2–3 Days Express',
        inStock: true,
        couponCode: 'REDCLUB400',
        couponDiscount: 400,
        verifiedMinutesAgo: 9
      }
    ],
    priceHistory90d: [
      { label: '90d ago', price: 15999 },
      { label: '75d ago', price: 14999 },
      { label: '60d ago', price: 14499 },
      { label: '45d ago', price: 13999 },
      { label: '30d ago', price: 12999 },
      { label: '15d ago', price: 12499 },
      { label: 'Today', price: 11999 }
    ],
    lowest90d: 11999,
    average90d: 13850,
    highest90d: 15999,
    variants: [
      { name: 'Gunmetal Gray', hex: '#334155' },
      { name: 'Forest Green', hex: '#065F46' }
    ]
  }
];

export interface AiPromptSuggestion {
  id: string;
  label: string;
  query: string;
  targetCategory: ProductCategory;
  maxPrice?: number;
  aiSummaryTitle: string;
  aiSummaryBody: string;
  recommendedIds: string[];
}

export const AI_PROMPT_SUGGESTIONS: AiPromptSuggestion[] = [
  {
    id: 'anc-under-5k',
    label: 'Best ANC headphones under ₹5,000',
    query: 'Best noise-cancelling headphones under ₹5,000 for work & travel',
    targetCategory: 'Audio',
    maxPrice: 5000,
    aiSummaryTitle: 'Audio Lab Synthesis: Best Noise Cancellation Under ₹5,000',
    aiSummaryBody:
      'ShopMate analyzed 18 wireless headphones under ₹5,000 across Amazon.in, Flipkart, and Croma. The Soundcore Space One Pro (₹4,499) ranks #1 with a 98% Match Score—delivering 42dB adaptive ANC, LDAC Hi-Res audio, and 55-hour battery life that beats models priced at ₹7,999.',
    recommendedIds: ['aether-anc-pro', 'sony-ult-wear-anc']
  },
  {
    id: 'wfh-desk-upgrade',
    label: 'WFH desk & typing setup under ₹15,000',
    query: 'Best mechanical keyboards and WFH desk upgrades under ₹15,000',
    targetCategory: 'Keyboards & Desk',
    maxPrice: 15000,
    aiSummaryTitle: 'Ergonomic & Acoustic Desk Upgrade Analysis',
    aiSummaryBody:
      'For daily coding and deep work, ShopMate recommends pairing a gasket-mounted mechanical keyboard with low-latency wireless. The AULA F75 (₹4,899) is the undisputed value king under ₹5,000, while the CNC-machined Keychron Q1 Pro (₹11,499) is the lifetime enthusiast benchmark.',
    recommendedIds: ['aula-f75-gasket', 'keychron-k2-pro-alu']
  },
  {
    id: 'lowest-90d-deals',
    label: 'Verified 90-day lowest price drops',
    query: 'Show products currently at their 90-day lowest price in India',
    targetCategory: 'All',
    aiSummaryTitle: 'Real-Time Price Tracker: Confirmed 90-Day Lows',
    aiSummaryBody:
      'We cross-checked current cart prices against 90-day historical pricing to filter out inflated MRP discounts. Every product below is trading 12%–26% below its 90-day rolling average, with extra instant coupon codes available at checkout.',
    recommendedIds: ['aether-anc-pro', 'apex-titanium-watch', 'barista-pid-espresso', 'ergo-spine-pro-chair']
  },
  {
    id: 'smartwatch-gps',
    label: 'AMOLED GPS smartwatch with 7+ day battery',
    query: 'Best AMOLED smartwatch with accurate GPS and multi-day battery life',
    targetCategory: 'Wearables',
    aiSummaryTitle: 'Wearables Endurance & Sensor Accuracy Comparison',
    aiSummaryBody:
      'Choose the Amazfit Balance Titanium (₹14,999) if you want iOS/Android compatibility, sapphire glass, and 14-day battery life. Choose the OnePlus Watch 2R (₹11,999) if you want full Google WearOS 4 apps (Google Maps, WhatsApp) with a 100-hour dual-engine battery.',
    recommendedIds: ['apex-titanium-watch', 'oneplus-watch-2r']
  }
];

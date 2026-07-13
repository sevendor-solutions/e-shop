import { Product, Category, Review, Order, Customer, Coupon, Banner, User } from '../types';

// Helper to get dates relative to today
const getDateDaysAgo = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
};

export const mockCategories: Category[] = [
  // Parent Categories
  {
    id: 'cat-1',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest gadgets, computers, smart home systems and personal audio.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'cat-2',
    name: 'Fashion',
    slug: 'fashion',
    description: 'Trendy clothing, stylish activewear, footwear, and designer accessories.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'cat-3',
    name: 'Home & Living',
    slug: 'home-living',
    description: 'Modern furniture, kitchen tools, cozy lighting, and beautiful decor items.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'cat-4',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Fitness trackers, outdoor hiking gear, camping equipment, and sports accessories.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'cat-5',
    name: 'Beauty & Health',
    slug: 'beauty-health',
    description: 'Premium skincare, makeup essentials, hair styling, and wellness products.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'cat-6',
    name: 'Toys & Games',
    slug: 'toys-games',
    description: 'Fun board games, building blocks, educational toys, and gaming gear.',
    image: 'https://images.unsplash.com/photo-1539627831859-a911cf04b3cd?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'cat-7',
    name: 'Books & Stationery',
    slug: 'books-stationery',
    description: 'Bestselling novels, notebooks, study guides, and fine pen collections.',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    status: 'active'
  },

  // Nested Categories (Electronics)
  {
    id: 'cat-1-1',
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Top-tier iOS and Android devices.',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80',
    parentId: 'cat-1',
    status: 'active'
  },
  {
    id: 'cat-1-2',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Powerful workstations and lightweight ultrabooks.',
    image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=300&auto=format&fit=crop&q=80',
    parentId: 'cat-1',
    status: 'active'
  },
  {
    id: 'cat-1-3',
    name: 'Audio Gear',
    slug: 'audio-gear',
    description: 'Noise-cancelling headphones, wireless earbuds, and speakers.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
    parentId: 'cat-1',
    status: 'active'
  },
  {
    id: 'cat-1-4',
    name: 'Accessories',
    slug: 'tech-accessories',
    description: 'Keyboards, chargers, cables, and adapters.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop&q=80',
    parentId: 'cat-1',
    status: 'active'
  },

  // Nested Categories (Fashion)
  {
    id: 'cat-2-1',
    name: 'Men\'s Fashion',
    slug: 'mens-fashion',
    description: 'Apparel and accessories tailored for men.',
    image: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=300&auto=format&fit=crop&q=80',
    parentId: 'cat-2',
    status: 'active'
  },
  {
    id: 'cat-2-2',
    name: 'Women\'s Fashion',
    slug: 'womens-fashion',
    description: 'Premium designs and apparel for women.',
    image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=300&auto=format&fit=crop&q=80',
    parentId: 'cat-2',
    status: 'active'
  },
  {
    id: 'cat-2-3',
    name: 'Footwear',
    slug: 'footwear',
    description: 'Sneakers, formal shoes, boots and sandals.',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&auto=format&fit=crop&q=80',
    parentId: 'cat-2',
    status: 'active'
  }
];

export const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Apollo Wireless Over-Ear Headphones',
    slug: 'apollo-wireless-headphones',
    description: 'Premium wireless headphones featuring industry-leading hybrid active noise cancellation, custom-tuned high-fidelity 40mm drivers, and up to 45 hours of playback time. The memory foam earcups provide exceptional long-wear comfort, and the built-in beamforming microphones ensure crystal-clear voice calls.',
    price: 249.99,
    originalPrice: 299.99,
    discount: 17,
    rating: 4.8,
    reviewCount: 142,
    category: 'audio-gear',
    brand: 'AeroSound',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 24,
    sku: 'AE-AP-100',
    specs: [
      { key: 'Driver Size', value: '40mm Dynamic' },
      { key: 'Frequency Response', value: '20Hz - 20kHz' },
      { key: 'Connectivity', value: 'Bluetooth 5.2, 3.5mm Jack' },
      { key: 'Battery Life', value: 'Up to 45 Hours (ANC off)' },
      { key: 'Charging Time', value: '2 Hours (USB-C)' }
    ],
    popular: true,
    bestSeller: true,
    newArrival: false,
    featured: true,
    tags: ['Headphones', 'ANC', 'Wireless', 'Premium'],
    variants: {
      colors: [
        { name: 'Matte Black', hex: '#1e293b' },
        { name: 'Platinum Silver', hex: '#cbd5e1' },
        { name: 'Deep Navy', hex: '#1e3a8a' }
      ]
    }
  },
  {
    id: 'prod-2',
    name: 'Spectre Pro 14" M3 Laptop',
    slug: 'spectre-pro-14-m3-laptop',
    description: 'Run demanding applications with ease. The Spectre Pro features an ultra-bright 14.2-inch Liquid Retina HDR screen, a powerful octacore CPU combined with 16GB of unified memory, and a superfast 512GB SSD. Perfect for developers, creators, and professionals on the move.',
    price: 1399.00,
    originalPrice: 1599.00,
    discount: 13,
    rating: 4.9,
    reviewCount: 68,
    category: 'laptops',
    brand: 'HexaTech',
    image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1496181130204-755241544e35?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 12,
    sku: 'HX-SP-14M3',
    specs: [
      { key: 'Processor', value: 'Octa-Core M3 Chipset' },
      { key: 'RAM', value: '16GB LPDDR5' },
      { key: 'Storage', value: '512GB NVMe SSD' },
      { key: 'Display', value: '14.2" mini-LED (120Hz)' },
      { key: 'OS', value: 'SpectreOS Core v4' }
    ],
    popular: true,
    bestSeller: false,
    newArrival: true,
    featured: true,
    tags: ['Laptop', 'Workstation', 'Developer', 'Creator'],
    variants: {
      colors: [
        { name: 'Space Gray', hex: '#4b5563' },
        { name: 'Silver Star', hex: '#e2e8f0' }
      ]
    }
  },
  {
    id: 'prod-3',
    name: 'Zenith Pro Smart Watch v2',
    slug: 'zenith-pro-smart-watch-v2',
    description: 'An advanced health and fitness companion. Features built-in GPS trackers, active SpO2 tracking, continuous heart rate notifications, and standard stress monitoring. Up to 14 days of battery life on a single charge and is completely water-resistant up to 50m (5ATM).',
    price: 189.99,
    originalPrice: 229.99,
    discount: 17,
    rating: 4.6,
    reviewCount: 310,
    category: 'tech-accessories',
    brand: 'NovaFit',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 45,
    sku: 'NF-ZN-V2',
    specs: [
      { key: 'Screen Size', value: '1.43" AMOLED Display' },
      { key: 'Sensors', value: 'Heart Rate, SpO2, Accelerometer, Barometer' },
      { key: 'Water Resistance', value: '5 ATM (50 meters)' },
      { key: 'Battery Life', value: 'Up to 14 Days (Typical Use)' },
      { key: 'Weight', value: '38g (without strap)' }
    ],
    popular: true,
    bestSeller: true,
    newArrival: false,
    featured: false,
    tags: ['Wearable', 'Smartwatch', 'Fitness', 'GPS'],
    variants: {
      sizes: ['40mm', '44mm'],
      colors: [
        { name: 'Charcoal Black', hex: '#0f172a' },
        { name: 'Alpine Green', hex: '#064e3b' },
        { name: 'Rose Sand', hex: '#fda4af' }
      ]
    }
  },
  {
    id: 'prod-4',
    name: 'Horizon 4K Ultra-Short Throw Projector',
    slug: 'horizon-4k-ust-projector',
    description: 'Transform your living room into an immersive cinema. The Horizon outputs a massive 120-inch 4K HDR projection from just 8 inches away from the wall. Boasting 2500 ANSI lumens, built-in Harman Kardon surround sound, and smart streaming applications.',
    price: 1899.99,
    originalPrice: 2499.99,
    discount: 24,
    rating: 4.7,
    reviewCount: 39,
    category: 'electronics',
    brand: 'Luxor',
    image: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 5,
    sku: 'LX-HZ-4K',
    specs: [
      { key: 'Resolution', value: '4K UHD (3840 x 2160)' },
      { key: 'Brightness', value: '2500 ANSI Lumens' },
      { key: 'Throw Ratio', value: '0.233:1' },
      { key: 'Audio', value: 'Dual 15W Harman Kardon speakers' },
      { key: 'Laser Source Life', value: '25,000 Hours' }
    ],
    popular: false,
    bestSeller: false,
    newArrival: true,
    featured: true,
    flashDeal: {
      discountPrice: 1799.00,
      endDate: new Date(Date.now() + 86400000 * 2).toISOString() // 2 days from now
    },
    tags: ['Projector', 'Home Cinema', '4K', 'Premium']
  },
  {
    id: 'prod-5',
    name: 'Velocity Leather Racing Sneakers',
    slug: 'velocity-leather-racing-sneakers',
    description: 'Engineered for street-ready styling and maximum foot support. Constructed from premium full-grain Italian leather, featuring impact-absorbing responsive soles and classic aerodynamic stitching. Extremely durable and breathable.',
    price: 119.99,
    originalPrice: 149.99,
    discount: 20,
    rating: 4.5,
    reviewCount: 95,
    category: 'footwear',
    brand: 'Stryder',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 50,
    sku: 'ST-VL-RD',
    specs: [
      { key: 'Upper Material', value: 'Full-Grain Leather' },
      { key: 'Sole Type', value: 'Vibram Traction Control' },
      { key: 'Insole', value: 'Ortholite Comfort Foam' },
      { key: 'Weight', value: '310g per shoe' }
    ],
    popular: true,
    bestSeller: true,
    newArrival: false,
    featured: false,
    tags: ['Sneakers', 'Shoes', 'Fashion', 'Leather'],
    variants: {
      sizes: ['8', '9', '10', '11'],
      colors: [
        { name: 'Racing Red', hex: '#b91c1c' },
        { name: 'Stealth Black', hex: '#18181b' },
        { name: 'Retro White', hex: '#f4f4f5' }
      ]
    }
  },
  {
    id: 'prod-6',
    name: 'Vanguard Ergonomic Office Chair',
    slug: 'vanguard-ergonomic-office-chair',
    description: 'An advanced ergonomic task chair designed to alleviate neck and lower back discomfort during long working sessions. Includes full lumbar height adjustments, fully adjustable 3D armrests, breathable structural mesh backing, and multi-position lock recline.',
    price: 349.00,
    originalPrice: 429.00,
    discount: 18,
    rating: 4.7,
    reviewCount: 78,
    category: 'furniture',
    brand: 'ErgoForm',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 18,
    sku: 'EF-VG-CH',
    specs: [
      { key: 'Material', value: 'Reinforced Nylon Frame, High-Elasticity Mesh' },
      { key: 'Maximum Load', value: '150kg (330lbs)' },
      { key: 'Recline Range', value: '90 - 135 Degrees' },
      { key: 'Gas Lift Class', value: 'Class 4 Heavy-Duty' }
    ],
    popular: true,
    bestSeller: false,
    newArrival: false,
    featured: true,
    tags: ['Office', 'Chair', 'Furniture', 'Ergonomic'],
    variants: {
      colors: [
        { name: 'Office Gray', hex: '#64748b' },
        { name: 'Pitch Black', hex: '#0f172a' }
      ]
    }
  },
  {
    id: 'prod-7',
    name: 'Titanium Dual-Walled Water Flask',
    slug: 'titanium-dual-walled-water-flask',
    description: 'Indestructible titanium flask featuring advanced vacuum thermal layers. Keeps cold drinks iced for 24 hours or coffee hot for 12 hours. Zero metal aftertaste, BPA-free, and weighs half as much as standard steel flasks.',
    price: 49.99,
    originalPrice: 59.99,
    discount: 16,
    rating: 4.4,
    reviewCount: 220,
    category: 'sports-outdoors',
    brand: 'Outward',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 120,
    sku: 'OW-TT-FLK',
    specs: [
      { key: 'Capacity', value: '750ml (25 oz)' },
      { key: 'Material', value: 'Grade 1 Pure Titanium' },
      { key: 'Insulation', value: 'Double-walled vacuum' },
      { key: 'Weight', value: '165g' }
    ],
    popular: false,
    bestSeller: true,
    newArrival: false,
    featured: false,
    tags: ['Flask', 'Water Bottle', 'Hiking', 'Outdoor'],
    variants: {
      sizes: ['500ml', '750ml', '1000ml'],
      colors: [
        { name: 'Raw Titanium', hex: '#94a3b8' },
        { name: 'Sandstone Gold', hex: '#d97706' },
        { name: 'Midnight Matte', hex: '#1e293b' }
      ]
    }
  },
  {
    id: 'prod-8',
    name: 'Vortex Mechanical Gaming Keyboard',
    slug: 'vortex-mechanical-gaming-keyboard',
    description: 'Ultra-responsive mechanical keyboard with pre-lubricated tactile linear switches, hot-swappable sockets, and vibrant per-key RGB backlighting. Double-shot PBT keycaps offer high resistance to grease and lettering fade.',
    price: 89.99,
    originalPrice: 119.99,
    discount: 25,
    rating: 4.8,
    reviewCount: 104,
    category: 'tech-accessories',
    brand: 'Viper',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 35,
    sku: 'VP-VX-KB',
    specs: [
      { key: 'Layout', value: '75% Compact Form Factor' },
      { key: 'Switch Type', value: 'Linear Switch (45g Actuation)' },
      { key: 'Keycaps', value: 'Double-Shot PBT' },
      { key: 'Hot-Swap Support', value: '3-pin / 5-pin compatible' },
      { key: 'Connection', value: 'Detachable USB-C, 2.4GHz Wireless, Bluetooth' }
    ],
    popular: true,
    bestSeller: false,
    newArrival: true,
    featured: false,
    flashDeal: {
      discountPrice: 79.99,
      endDate: new Date(Date.now() + 86400000 * 1.5).toISOString()
    },
    tags: ['Keyboard', 'Mechanical', 'RGB', 'Gaming'],
    variants: {
      colors: [
        { name: 'Glacier White', hex: '#f8fafc' },
        { name: 'Dark Void', hex: '#020617' }
      ]
    }
  },
  {
    id: 'prod-9',
    name: 'C100 Premium Espresso Coffee Mug',
    slug: 'c100-premium-espresso-coffee-mug',
    description: 'Beautifully hand-crafted ceramic mugs built to retain beverage temperatures longer. The textured exterior glaze offers an ergonomic grip, while the minimalist interior makes it easy to clean. Micro-oven and dishwasher safe.',
    price: 15.99,
    originalPrice: 19.99,
    discount: 20,
    rating: 4.3,
    reviewCount: 312,
    category: 'home-living',
    brand: 'ClayWorks',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 200,
    sku: 'CW-C100-MG',
    specs: [
      { key: 'Volume', value: '350ml (12 oz)' },
      { key: 'Material', value: 'Stoneware Clay' },
      { key: 'Dishwasher Safe', value: 'Yes' },
      { key: 'Microwave Safe', value: 'Yes' }
    ],
    popular: false,
    bestSeller: true,
    newArrival: false,
    featured: false,
    tags: ['Mug', 'Ceramic', 'Coffee', 'Kitchen'],
    variants: {
      colors: [
        { name: 'Clay Gray', hex: '#a8a29e' },
        { name: 'Vanilla Cream', hex: '#fafaf9' },
        { name: 'Oceanside Teal', hex: '#0f766e' }
      ]
    }
  },
  {
    id: 'prod-10',
    name: 'Skinsync Hydrating Facial Serum',
    slug: 'skinsync-hydrating-facial-serum',
    description: 'Infused with double-layered hyaluronic acid, plant-derived squalane, and vitamin B5. This lightweight, fast-absorbing serum penetrates deeply to plump fine lines, restore moisture reservoirs, and reinforce the skin barrier.',
    price: 34.00,
    originalPrice: 42.00,
    discount: 19,
    rating: 4.6,
    reviewCount: 88,
    category: 'beauty-health',
    brand: 'Skinsync',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&auto=format&fit=crop&q=80'
    ],
    stock: 80,
    sku: 'SS-HY-SRM',
    specs: [
      { key: 'Key Ingredients', value: 'Hyaluronic Acid, Vitamin B5, Squalane' },
      { key: 'Volume', value: '50ml (1.7 fl. oz)' },
      { key: 'Skin Type', value: 'All (including sensitive)' },
      { key: 'Cruelty Free', value: 'Yes' }
    ],
    popular: true,
    bestSeller: false,
    newArrival: true,
    featured: false,
    tags: ['Serums', 'Skincare', 'Hydrating', 'Beauty']
  }
];

export const mockReviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    userName: 'David Anderson',
    userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop',
    rating: 5,
    comment: 'The noise cancellation is phenomenal, absolutely silences the train hum. Audio quality is crisp with deep, controlled bass. Worth every penny!',
    date: getDateDaysAgo(3),
    status: 'approved'
  },
  {
    id: 'rev-2',
    productId: 'prod-1',
    userName: 'Elena Rostova',
    userAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
    rating: 4,
    comment: 'Sound is 5 stars, but the earcups get slightly warm during long 4+ hour sessions. Overall extremely satisfied, charging speeds are blazing fast.',
    date: getDateDaysAgo(10),
    status: 'approved'
  },
  {
    id: 'rev-3',
    productId: 'prod-2',
    userName: 'Mark Zuckerberg',
    userAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop',
    rating: 5,
    comment: 'Compiles large React codebases in seconds. Displays are stunning, battery life lasts me all day. Price is steep but it pays for itself in productivity.',
    date: getDateDaysAgo(5),
    status: 'approved'
  },
  {
    id: 'rev-4',
    productId: 'prod-3',
    userName: 'Sophia Martinez',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop',
    rating: 4,
    comment: 'Love the health metrics tracking. The step counts are accurate compared to my treadmill readings. The sleep scores are very insightful.',
    date: getDateDaysAgo(8),
    status: 'approved'
  }
];

export const mockBanners: Banner[] = [
  {
    id: 'ban-1',
    title: 'Future Tech at Your Fingertips',
    subtitle: 'Save up to 30% on premium workspaces, laptops, and ANC headphones.',
    image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=electronics',
    type: 'hero',
    status: 'active'
  },
  {
    id: 'ban-2',
    title: 'Elevate Your Active Lifestyle',
    subtitle: 'New performance sportswear and titanium gear arrivals.',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=sports-outdoors',
    type: 'hero',
    status: 'active'
  },
  {
    id: 'ban-3',
    title: 'Summer Fashion Collection',
    subtitle: 'Lightweight linen, retro designs, and premium footwear.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=fashion',
    type: 'hero',
    status: 'active'
  },
  {
    id: 'ban-4',
    title: 'Modern Living Makeovers',
    subtitle: 'Save up to 25% on stylish minimalist furniture, tableware, and lighting.',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=home-living',
    type: 'hero',
    status: 'active'
  },
  {
    id: 'ban-5',
    title: 'Radiant Beauty Essentials',
    subtitle: 'Unlock glowing skin with organic serums and premium cosmetics.',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&auto=format&fit=crop&q=80',
    link: '/products?category=beauty-health',
    type: 'hero',
    status: 'active'
  }
];

export const mockCoupons: Coupon[] = [
  {
    id: 'cp-1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minPurchase: 50,
    maxDiscount: 20,
    expiryDate: '2027-12-31',
    usageLimit: 1000,
    usageCount: 231,
    status: 'active'
  },
  {
    id: 'cp-2',
    code: 'SUPERDEAL50',
    type: 'fixed',
    value: 50,
    minPurchase: 300,
    expiryDate: '2026-11-30',
    usageLimit: 100,
    usageCount: 88,
    status: 'active'
  },
  {
    id: 'cp-3',
    code: 'EXPIRED15',
    type: 'percentage',
    value: 15,
    minPurchase: 40,
    expiryDate: '2025-01-01',
    usageLimit: 50,
    usageCount: 50,
    status: 'expired'
  },
  {
    id: 'cp-4',
    code: 'SUMMER25',
    type: 'percentage',
    value: 25,
    minPurchase: 80,
    expiryDate: '2026-08-31',
    usageLimit: 500,
    usageCount: 124,
    status: 'active'
  },
  {
    id: 'cp-5',
    code: 'FREESHIP',
    type: 'fixed',
    value: 10,
    minPurchase: 100,
    expiryDate: '2027-01-01',
    usageLimit: 1000,
    usageCount: 456,
    status: 'active'
  },
  {
    id: 'cp-6',
    code: 'BLACKFRIDAY',
    type: 'percentage',
    value: 40,
    minPurchase: 150,
    maxDiscount: 100,
    expiryDate: '2026-11-30',
    usageLimit: 300,
    usageCount: 0,
    status: 'active'
  },
  {
    id: 'cp-7',
    code: 'SAVEMORE',
    type: 'fixed',
    value: 15,
    minPurchase: 75,
    expiryDate: '2026-09-30',
    usageLimit: 250,
    usageCount: 92,
    status: 'active'
  },
  {
    id: 'cp-8',
    code: 'CYBER20',
    type: 'percentage',
    value: 20,
    minPurchase: 60,
    expiryDate: '2026-12-05',
    usageLimit: 400,
    usageCount: 15,
    status: 'active'
  }
];

export const mockCustomers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Jane Doe',
    email: 'customer@eshop.com',
    phone: '+1 (555) 123-4567',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop',
    status: 'active',
    totalOrders: 3,
    totalSpent: 489.97,
    createdAt: getDateDaysAgo(90),
    addresses: [
      {
        id: 'addr-1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'customer@eshop.com',
        phone: '+1 (555) 123-4567',
        addressLine1: '123 Pine Street',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'United States',
        isDefault: true
      }
    ]
  },
  {
    id: 'cust-2',
    name: 'Robert Miller',
    email: 'rob.miller@example.com',
    phone: '+1 (555) 987-6543',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop',
    status: 'active',
    totalOrders: 8,
    totalSpent: 2150.00,
    createdAt: getDateDaysAgo(200),
    addresses: [
      {
        id: 'addr-2',
        firstName: 'Robert',
        lastName: 'Miller',
        email: 'rob.miller@example.com',
        phone: '+1 (555) 987-6543',
        addressLine1: '456 Oak Avenue',
        city: 'San Francisco',
        state: 'CA',
        postalCode: '94102',
        country: 'United States',
        isDefault: true
      }
    ]
  },
  {
    id: 'cust-3',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    phone: '+44 20 7946 0958',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop',
    status: 'suspended',
    totalOrders: 1,
    totalSpent: 89.99,
    createdAt: getDateDaysAgo(45),
    addresses: [
      {
        id: 'addr-3',
        firstName: 'Sarah',
        lastName: 'Jenkins',
        email: 'sarah.j@example.com',
        phone: '+44 20 7946 0958',
        addressLine1: '78 High Street',
        city: 'London',
        state: 'Greater London',
        postalCode: 'EC1A 1BB',
        country: 'United Kingdom',
        isDefault: true
      }
    ]
  }
];

export const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ESHOP-2026-9843',
    customerId: 'cust-1',
    customerName: 'Jane Doe',
    customerEmail: 'customer@eshop.com',
    date: getDateDaysAgo(2),
    items: [
      {
        id: 'oi-1',
        productId: 'prod-1',
        name: 'Apollo Wireless Over-Ear Headphones',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop',
        price: 249.99,
        quantity: 1,
        selectedColor: 'Matte Black'
      },
      {
        id: 'oi-2',
        productId: 'prod-8',
        name: 'Vortex Mechanical Gaming Keyboard',
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=300&auto=format&fit=crop',
        price: 89.99,
        quantity: 1,
        selectedColor: 'Dark Void'
      }
    ],
    subtotal: 339.98,
    discount: 34.00, // WELCOME10 coupon
    tax: 24.48,
    shipping: 10.00,
    total: 340.46,
    status: 'processing',
    shippingAddress: mockCustomers[0].addresses[0],
    billingAddress: mockCustomers[0].addresses[0],
    paymentMethod: 'credit_card',
    paymentStatus: 'paid'
  },
  {
    id: 'ord-2',
    orderNumber: 'ESHOP-2026-9502',
    customerId: 'cust-2',
    customerName: 'Robert Miller',
    customerEmail: 'rob.miller@example.com',
    date: getDateDaysAgo(15),
    items: [
      {
        id: 'oi-3',
        productId: 'prod-2',
        name: 'Spectre Pro 14" M3 Laptop',
        image: 'https://images.unsplash.com/photo-1496181130204-755241544e35?w=300&auto=format&fit=crop',
        price: 1399.00,
        quantity: 1,
        selectedColor: 'Space Gray'
      }
    ],
    subtotal: 1399.00,
    discount: 0,
    tax: 111.92,
    shipping: 0, // Free shipping on large orders
    total: 1510.92,
    status: 'delivered',
    shippingAddress: mockCustomers[1].addresses[0],
    billingAddress: mockCustomers[1].addresses[0],
    paymentMethod: 'paypal',
    paymentStatus: 'paid',
    trackingNumber: 'TRK-983174291-US',
    invoiceUrl: '#'
  },
  {
    id: 'ord-3',
    orderNumber: 'ESHOP-2026-9110',
    customerId: 'cust-3',
    customerName: 'Sarah Jenkins',
    customerEmail: 'sarah.j@example.com',
    date: getDateDaysAgo(30),
    items: [
      {
        id: 'oi-4',
        productId: 'prod-7',
        name: 'Titanium Dual-Walled Water Flask',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop',
        price: 49.99,
        quantity: 1,
        selectedColor: 'Raw Titanium',
        selectedSize: '750ml'
      }
    ],
    subtotal: 49.99,
    discount: 0,
    tax: 4.00,
    shipping: 5.99,
    total: 59.98,
    status: 'cancelled',
    shippingAddress: mockCustomers[2].addresses[0],
    billingAddress: mockCustomers[2].addresses[0],
    paymentMethod: 'cash_on_delivery',
    paymentStatus: 'failed'
  }
];

export const mockUsers: User[] = [
  {
    id: 'usr-1',
    name: 'Administrator',
    email: 'admin@eshop.com',
    role: 'admin',
    status: 'active',
    permissions: ['all'],
    createdAt: getDateDaysAgo(365)
  },
  {
    id: 'usr-2',
    name: 'Store Manager',
    email: 'manager@eshop.com',
    role: 'manager',
    status: 'active',
    permissions: ['products:read', 'products:write', 'orders:read', 'orders:write', 'categories:read', 'categories:write'],
    createdAt: getDateDaysAgo(180)
  },
  {
    id: 'usr-3',
    name: 'Jane Doe',
    email: 'customer@eshop.com',
    role: 'customer',
    status: 'active',
    permissions: [],
    createdAt: getDateDaysAgo(90)
  }
];

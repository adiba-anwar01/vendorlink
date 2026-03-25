// ─── Products ────────────────────────────────────────────────────────────────

export const products = [
  {
    id: 'prod_001',
    title: 'Apple iPhone 14 Pro – 256GB Space Black',
    description: 'Excellent condition. Used for 6 months. No scratches, original box and accessories included.',
    price: 850,
    category: 'Electronics',
    condition: 'Used',
    location: 'New York, NY',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
    ],
    views: 124,
    inquiries: 8,
    createdAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'prod_002',
    title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
    description: 'Brand new, sealed in original packaging. Purchased as a gift but keeping my old ones.',
    price: 280,
    category: 'Electronics',
    condition: 'New',
    location: 'Brooklyn, NY',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    ],
    views: 89,
    inquiries: 5,
    createdAt: '2026-03-02T09:00:00Z',
  },
  {
    id: 'prod_003',
    title: 'Vintage Leather Messenger Bag',
    description: 'Hand-crafted genuine leather bag. Well maintained, minor patina adds character.',
    price: 120,
    category: 'Fashion',
    condition: 'Used',
    location: 'Manhattan, NY',
    status: 'Sold',
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80',
    ],
    views: 210,
    inquiries: 14,
    createdAt: '2026-02-20T14:00:00Z',
  },
  {
    id: 'prod_004',
    title: 'MacBook Air M2 – 8GB / 256GB Midnight',
    description: 'Light use, in perfect condition. AppleCare until 2027. Comes with original charger.',
    price: 1050,
    category: 'Electronics',
    condition: 'Used',
    location: 'Queens, NY',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1611186871525-7f20a89f8cef?w=600&auto=format&fit=crop&q=80',
    ],
    views: 305,
    inquiries: 23,
    createdAt: '2026-02-25T11:00:00Z',
  },
  {
    id: 'prod_005',
    title: 'IKEA KALLAX Shelving Unit',
    description: 'Good condition. Minor surface scratches. Comes with inserts. Self-pickup only.',
    price: 45,
    category: 'Furniture',
    condition: 'Used',
    location: 'Staten Island, NY',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    ],
    views: 67,
    inquiries: 3,
    createdAt: '2026-03-03T16:00:00Z',
  },
  {
    id: 'prod_006',
    title: 'Canon EOS R50 Mirrorless Camera Kit',
    description: 'Includes 18-45mm kit lens, extra battery, 64GB memory card. Rarely used.',
    price: 650,
    category: 'Electronics',
    condition: 'Used',
    location: 'Bronx, NY',
    status: 'Active',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    ],
    views: 178,
    inquiries: 11,
    createdAt: '2026-03-05T08:30:00Z',
  },
  {
    id: 'prod_007', title: 'Apple Magic Keyboard', description: 'White, great condition', price: 70, category: 'Electronics', condition: 'Used', location: 'Brooklyn, NY', status: 'Active', images: [], views: 10, inquiries: 1, createdAt: '2026-03-05T09:00:00Z',
  },
  {
    id: 'prod_008', title: 'Logitech MX Master 3S', description: 'Like new', price: 80, category: 'Electronics', condition: 'New', location: 'NY', status: 'Active', images: [], views: 20, inquiries: 2, createdAt: '2026-03-05T10:00:00Z',
  },
  {
    id: 'prod_009', title: 'Ergonomic Office Chair', description: 'Mesh back, lumbar support', price: 150, category: 'Furniture', condition: 'Used', location: 'NY', status: 'Active', images: [], views: 30, inquiries: 3, createdAt: '2026-03-05T11:00:00Z',
  },
  {
    id: 'prod_010', title: 'Standing Desk Converter', description: 'Adjustable height', price: 120, category: 'Furniture', condition: 'Used', location: 'NY', status: 'Active', images: [], views: 15, inquiries: 1, createdAt: '2026-03-05T12:00:00Z',
  },
  {
    id: 'prod_011', title: 'Nike Air Max 270', description: 'Size 10, worn once', price: 110, category: 'Fashion', condition: 'Used', location: 'NY', status: 'Active', images: [], views: 40, inquiries: 4, createdAt: '2026-03-05T13:00:00Z',
  },
  {
    id: 'prod_012', title: 'Adidas Ultraboost', description: 'Size 9.5, new in box', price: 140, category: 'Fashion', condition: 'New', location: 'NY', status: 'Active', images: [], views: 50, inquiries: 5, createdAt: '2026-03-05T14:00:00Z',
  },
  {
    id: 'prod_013', title: 'Levi\'s Denim Jacket', description: 'Vintage wash, Size L', price: 60, category: 'Fashion', condition: 'Used', location: 'NY', status: 'Active', images: [], views: 25, inquiries: 2, createdAt: '2026-03-05T15:00:00Z',
  },
  {
    id: 'prod_014', title: 'Yeti Rambler 20 oz', description: 'Stainless steel tumbler', price: 30, category: 'Other', condition: 'New', location: 'NY', status: 'Active', images: [], views: 12, inquiries: 0, createdAt: '2026-03-05T16:00:00Z',
  },
  {
    id: 'prod_015', title: 'Kindle Paperwhite', description: '8GB, Waterproof', price: 100, category: 'Electronics', condition: 'Used', location: 'NY', status: 'Active', images: [], views: 80, inquiries: 8, createdAt: '2026-03-05T17:00:00Z',
  },
  {
    id: 'prod_016', title: 'Nintendo Switch OLED', description: 'White Joy-Cons, dock included', price: 280, category: 'Electronics', condition: 'Used', location: 'NY', status: 'Active', images: [], views: 150, inquiries: 15, createdAt: '2026-03-05T18:00:00Z',
  }
];

// ─── Buyers ──────────────────────────────────────────────────────────────────

export const buyers = [
  { id: 'buyer_001', name: 'Sarah Chen',  avatar: 'SC', email: 'sarah@email.com' },
  { id: 'buyer_002', name: 'Marcus Lee',  avatar: 'ML', email: 'marcus@email.com' },
  { id: 'buyer_003', name: 'Priya Patel', avatar: 'PP', email: 'priya@email.com' },
  { id: 'buyer_004', name: 'David Kim',   avatar: 'DK', email: 'david@email.com' },
];

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversations = [
  {
    conversation_id: 'conv_001',
    product_id: 'prod_001',
    buyer_id: 'buyer_001',
    vendor_id: 'vendor_001',
    lastMessage: 'Is the phone still available?',
    timestamp: '2026-03-08T21:30:00Z',
    unread: 2,
    messages: [
      { id: 'm1', sender_id: 'buyer_001', message_text: 'Hi! Is the iPhone still available?', timestamp: '2026-03-08T20:00:00Z' },
      { id: 'm2', sender_id: 'vendor_001', message_text: 'Yes, it\'s still available! Are you interested?', timestamp: '2026-03-08T20:05:00Z' },
      { id: 'm3', sender_id: 'buyer_001', message_text: 'Great! Can you do $800?', timestamp: '2026-03-08T20:10:00Z' },
      { id: 'm4', sender_id: 'vendor_001', message_text: 'Best I can do is $820. It\'s in perfect condition.', timestamp: '2026-03-08T20:15:00Z' },
      { id: 'm5', sender_id: 'buyer_001', message_text: 'Is the phone still available?', timestamp: '2026-03-08T21:30:00Z' },
    ],
  },
  {
    conversation_id: 'conv_002',
    product_id: 'prod_004',
    buyer_id: 'buyer_002',
    vendor_id: 'vendor_001',
    lastMessage: 'Does it include the original charger?',
    timestamp: '2026-03-08T19:45:00Z',
    unread: 0,
    messages: [
      { id: 'm6', sender_id: 'buyer_002', message_text: 'Hello, I\'m interested in the MacBook. Does it include the original charger?', timestamp: '2026-03-08T19:00:00Z' },
      { id: 'm7', sender_id: 'vendor_001', message_text: 'Yes! Comes with the original MagSafe charger and USB-C cable.', timestamp: '2026-03-08T19:15:00Z' },
      { id: 'm8', sender_id: 'buyer_002', message_text: 'Does it include the original charger?', timestamp: '2026-03-08T19:45:00Z' },
    ],
  },
  {
    conversation_id: 'conv_003',
    product_id: 'prod_002',
    buyer_id: 'buyer_003',
    vendor_id: 'vendor_001',
    lastMessage: 'Can you ship to California?',
    timestamp: '2026-03-07T14:20:00Z',
    unread: 1,
    messages: [
      { id: 'm9',  sender_id: 'buyer_003', message_text: 'Hi! Are these headphones sealed in original box?', timestamp: '2026-03-07T12:00:00Z' },
      { id: 'm10', sender_id: 'vendor_001', message_text: 'Yes, 100% sealed. Never opened.', timestamp: '2026-03-07T12:10:00Z' },
      { id: 'm11', sender_id: 'buyer_003', message_text: 'Can you ship to California?', timestamp: '2026-03-07T14:20:00Z' },
    ],
  },
  {
    conversation_id: 'conv_004',
    product_id: 'prod_006',
    buyer_id: 'buyer_004',
    vendor_id: 'vendor_001',
    lastMessage: 'How many shutter actuations?',
    timestamp: '2026-03-06T11:00:00Z',
    unread: 0,
    messages: [
      { id: 'm12', sender_id: 'buyer_004', message_text: 'Hi! How many shutter actuations does the camera have?', timestamp: '2026-03-06T11:00:00Z' },
    ],
  },
];

// ─── Orders ──────────────────────────────────────────────────────────────────

export const orders = [
  {
    id: 'ord_001',
    product_id: 'prod_003',
    product_title: 'Vintage Leather Messenger Bag',
    buyer_id: 'buyer_002',
    buyer_name: 'Marcus Lee',
    price: 120,
    status: 'Completed',
    date: '2026-02-28T10:00:00Z',
  },
  {
    id: 'ord_002',
    product_id: 'prod_001',
    product_title: 'Apple iPhone 14 Pro – 256GB',
    buyer_id: 'buyer_001',
    buyer_name: 'Sarah Chen',
    price: 820,
    status: 'Confirmed',
    date: '2026-03-05T14:30:00Z',
  },
  {
    id: 'ord_003',
    product_id: 'prod_004',
    product_title: 'MacBook Air M2 – Midnight',
    buyer_id: 'buyer_003',
    buyer_name: 'Priya Patel',
    price: 1050,
    status: 'Pending',
    date: '2026-03-08T09:15:00Z',
  },
  {
    id: 'ord_004',
    product_id: 'prod_002',
    product_title: 'Sony WH-1000XM5 Headphones',
    buyer_id: 'buyer_004',
    buyer_name: 'David Kim',
    price: 275,
    status: 'Pending',
    date: '2026-03-08T20:00:00Z',
  },
];

// ─── Analytics ───────────────────────────────────────────────────────────────

export const monthlyOrders = [
  { month: 'Oct', orders: 4,  revenue: 620  },
  { month: 'Nov', orders: 7,  revenue: 1340 },
  { month: 'Dec', orders: 11, revenue: 2890 },
  { month: 'Jan', orders: 6,  revenue: 980  },
  { month: 'Feb', orders: 9,  revenue: 2120 },
  { month: 'Mar', orders: 4,  revenue: 2265 },
];

export const productViews = [
  { product: 'MacBook Air M2',  views: 305 },
  { product: 'iPhone 14 Pro',   views: 124 },
  { product: 'Sony Headphones', views: 89  },
  { product: 'Canon R50',       views: 178 },
  { product: 'Leather Bag',     views: 67  },
  { product: 'KALLAX Shelf',    views: 45  },
];

export const inquiriesPerProduct = [
  { product: 'MacBook Air M2',  inquiries: 23 },
  { product: 'iPhone 14 Pro',   inquiries: 8  },
  { product: 'Sony Headphones', inquiries: 5  },
  { product: 'Canon R50',       inquiries: 11 },
  { product: 'Leather Bag',     inquiries: 14 },
  { product: 'KALLAX Shelf',    inquiries: 3  },
];

export const categories = ['Electronics', 'Fashion', 'Furniture', 'Books', 'Sports', 'Toys', 'Other'];
export const conditions = ['New', 'Used'];

// ─── User-Listed Items (browseable marketplace items posted by buyers) ─────────

export const userListings = [
  {
    id: 'ul_001',
    title: 'Samsung Galaxy S23 Ultra – 256GB Phantom Black',
    price: 720,
    category: 'Mobile',
    condition: 'Used',
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=80',
    seller: 'James W.',
    createdAt: '2026-03-18T10:00:00Z',
    lat: 12.9716,  // ~2 km from center — Bengaluru MG Road area
    lng: 77.5946,
  },
  {
    id: 'ul_002',
    title: 'IKEA BEKANT Standing Desk – White 160×80cm',
    price: 180,
    category: 'Furniture',
    condition: 'Used',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&auto=format&fit=crop&q=80',
    seller: 'Nina R.',
    createdAt: '2026-03-17T14:30:00Z',
    lat: 12.9850,  // ~4 km — Indiranagar
    lng: 77.6101,
  },
  {
    id: 'ul_003',
    title: 'Apple iPad Pro 12.9" M2 – 256GB WiFi',
    price: 880,
    category: 'Electronics',
    condition: 'New',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    seller: 'Carla M.',
    createdAt: '2026-03-16T09:00:00Z',
    lat: 12.9352,  // ~7 km — Jayanagar
    lng: 77.5828,
  },
  {
    id: 'ul_004',
    title: 'Google Pixel 8 Pro – 128GB Hazel',
    price: 590,
    category: 'Mobile',
    condition: 'Used',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80',
    seller: 'Raj P.',
    createdAt: '2026-03-15T11:45:00Z',
    lat: 13.0100,  // ~12 km — Hebbal
    lng: 77.5941,
  },
  {
    id: 'ul_005',
    title: 'West Elm Mid-Century Sofa – Walnut/Linen',
    price: 620,
    category: 'Furniture',
    condition: 'Used',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
    seller: 'Beth K.',
    createdAt: '2026-03-14T08:20:00Z',
    lat: 12.9000,  // ~9 km — Bannerghatta Rd
    lng: 77.5800,
  },
  {
    id: 'ul_006',
    title: 'Dell XPS 15 9530 – Intel i7, 16GB, RTX 4060',
    price: 1150,
    category: 'Electronics',
    condition: 'Used',
    image: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&auto=format&fit=crop&q=80',
    seller: 'Tom H.',
    createdAt: '2026-03-13T15:00:00Z',
    lat: 13.0358,  // ~20 km — Yelahanka
    lng: 77.5970,
  },
  {
    id: 'ul_007',
    title: 'OnePlus 12 – 256GB Silky Black',
    price: 460,
    category: 'Mobile',
    condition: 'New',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80',
    seller: 'Aisha F.',
    createdAt: '2026-03-12T12:00:00Z',
    lat: 12.8400,  // ~22 km — Electronic City
    lng: 77.6780,
  },
  {
    id: 'ul_008',
    title: 'Herman Miller Aeron Chair – Size B Graphite',
    price: 750,
    category: 'Furniture',
    condition: 'Used',
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600&auto=format&fit=crop&q=80',
    seller: 'Lena S.',
    createdAt: '2026-03-11T07:30:00Z',
    lat: 13.0827,  // ~38 km — Doddaballapura direction
    lng: 77.5800,
  },
  {
    id: 'ul_009',
    title: 'Sony PlayStation 5 Digital Edition',
    price: 380,
    category: 'Electronics',
    condition: 'Used',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
    seller: 'Kevin L.',
    createdAt: '2026-03-10T18:00:00Z',
    lat: 12.7800,
    lng: 77.4100,
  },
  { id: 'ul_010', title: 'Apple Watch Series 9', price: 320, category: 'Electronics', condition: 'New', image: '', seller: 'Sarah M.', createdAt: '2026-03-10T17:00:00Z', lat: 12.91, lng: 77.60 },
  { id: 'ul_011', title: 'Bose QuietComfort 45', price: 250, category: 'Electronics', condition: 'Used', image: '', seller: 'Mike T.', createdAt: '2026-03-10T16:00:00Z', lat: 12.92, lng: 77.61 },
  { id: 'ul_012', title: 'Dyson V15 Detect', price: 500, category: 'Electronics', condition: 'Used', image: '', seller: 'Emily R.', createdAt: '2026-03-10T15:00:00Z', lat: 12.93, lng: 77.62 },
  { id: 'ul_013', title: 'Nespresso Vertuo Plus', price: 120, category: 'Other', condition: 'Used', image: '', seller: 'John D.', createdAt: '2026-03-10T14:00:00Z', lat: 12.94, lng: 77.63 },
  { id: 'ul_014', title: 'Vitamix 5200 Blender', price: 350, category: 'Other', condition: 'Used', image: '', seller: 'Anna P.', createdAt: '2026-03-10T13:00:00Z', lat: 12.95, lng: 77.64 },
  { id: 'ul_015', title: 'Patagonia Fleece Jacket', price: 80, category: 'Fashion', condition: 'Used', image: '', seller: 'Chris B.', createdAt: '2026-03-10T12:00:00Z', lat: 12.96, lng: 77.65 },
  { id: 'ul_016', title: 'Ray-Ban Aviator Sunglasses', price: 100, category: 'Fashion', condition: 'New', image: '', seller: 'Lisa F.', createdAt: '2026-03-10T11:00:00Z', lat: 12.97, lng: 77.66 },
];

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: 'outerwear' | 'bottoms' | 'accessories';
  story: string;
  originalJeansCount: number; // Number of old jeans used to create this product
  artisanDifficulty: 'Trung bình' | 'Khó' | 'Cực khó'; // Difficulty level of making it
  measurements: {
    chest?: string;
    length?: string;
    waist?: string;
    thigh?: string;
    headSize?: string;
  };
  sizes: string[];
  isOneOfOne: boolean;
  isBestSeller?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

export interface DonationSubmission {
  id: string;
  donorName: string;
  phone: string;
  email: string;
  address: string;
  jeansCount: number;
  condition: 'like-new' | 'worn-out' | 'distressed' | 'scrap';
  description: string;
  status: 'pending' | 'shipping' | 'received' | 'processed' | 'rejected';
  suggestedOutput: string; // The "Old Jeans, New Story" suggestion generated dynamically or from predefined options
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note?: string;
  items: CartItem[];
  totalPrice: number;
  paymentMethod: 'COD';
  status: 'pending' | 'confirmed' | 'shipping' | 'completed';
  createdAt: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  providerId: 'password' | 'google' | 'facebook' | 'instagram';
  phoneNumber?: string;
  address?: string;
  points?: number; // Loyalty points for upcycling!
  role?: 'admin' | 'user';
}


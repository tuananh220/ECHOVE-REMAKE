export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  images: string[];
  category: 'outerwear' | 'bottoms' | 'accessories' | 'handbags';
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
  originalPrice?: number; // Price before discount
  discountApplied?: number; // Discount amount in VND
  appliedVoucherCode?: string; // Voucher code used
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

export interface Voucher {
  id: string; // The coupon code itself, e.g. "REBORN10", "ECHOVEWELCOME"
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 10 (%) or 50000 (VND)
  minOrderValue: number; // e.g. 200000 (VND)
  expiryDate: string; // e.g. "2026-12-31"
  usageLimit?: number; // e.g. total times it can be used, optional
  usageCount: number; // times used so far
  description: string; // e.g. "Giảm 50k cho đơn từ 200k"
  isActive: boolean;
  createdAt: string;
}

export interface EmailConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  isEnabled: boolean;
}

export interface EmailLog {
  id: string;
  toEmail: string;
  recipientName: string;
  subject: string;
  type: 'order_confirmation' | 'donation_received';
  content: string; // HTML or detailed text summary of the email
  status: 'simulated' | 'sent' | 'failed';
  errorMessage?: string;
  createdAt: string;
}


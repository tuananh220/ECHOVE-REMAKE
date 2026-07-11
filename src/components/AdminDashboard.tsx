import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Users, Gift, Layers, Search, Plus, Trash2, 
  CheckCircle, ArrowRight, RefreshCw, Filter, ShieldAlert, 
  ChevronRight, Award, Edit3, X, Coins, Eye, TrendingUp, Check, Play,
  Tag, Mail, Settings, Calendar, DollarSign, Percent, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { Product, Order, DonationSubmission, User, Voucher, EmailConfig, EmailLog } from '../types';
import { PRODUCTS } from '../data';
import { 
  getAllOrders, 
  getAllDonations, 
  getAllUsers, 
  updateOrderStatus, 
  updateDonationStatus, 
  rewardMemberPoints,
  getAllVouchers,
  createVoucher,
  deleteVoucher,
  getEmailConfig,
  saveEmailConfig,
  getAllEmailLogs,
  getAllProducts,
  createProduct,
  deleteProduct,
  db
} from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface AdminDashboardProps {
  user: User | null;
  onProductUpdate?: (updatedProducts: Product[]) => void;
}

export default function AdminDashboard({ user, onProductUpdate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'donations' | 'users' | 'vouchers' | 'emails'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [donations, setDonations] = useState<DonationSubmission[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Voucher states
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isAddVoucherOpen, setIsAddVoucherOpen] = useState(false);
  const [newVoucherId, setNewVoucherId] = useState('');
  const [newVoucherDesc, setNewVoucherDesc] = useState('');
  const [newVoucherType, setNewVoucherType] = useState<'percentage' | 'fixed'>('fixed');
  const [newVoucherValue, setNewVoucherValue] = useState<number>(50000);
  const [newVoucherMinOrder, setNewVoucherMinOrder] = useState<number>(200000);
  const [newVoucherExpiry, setNewVoucherExpiry] = useState<string>('2026-12-31');
  const [newVoucherLimit, setNewVoucherLimit] = useState<number | undefined>(undefined);
  const [isSavingVoucher, setIsSavingVoucher] = useState(false);

  // Email states
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [emailConfig, setEmailConfig] = useState<EmailConfig>({
    serviceId: '',
    templateId: '',
    publicKey: '',
    isEnabled: false
  });
  const [isSavingEmailConfig, setIsSavingEmailConfig] = useState(false);
  const [viewingEmailBody, setViewingEmailBody] = useState<string | null>(null);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form states for creating a new product
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(450000);
  const [newProdCategory, setNewProdCategory] = useState<'outerwear' | 'bottoms' | 'accessories' | 'handbags'>('outerwear');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStory, setNewProdStory] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>(['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=60']);
  const [newImageUrlInput, setNewImageUrlInput] = useState('');
  const [newProdJeansCount, setNewProdJeansCount] = useState<number>(2);
  const [newProdDifficulty, setNewProdDifficulty] = useState<string>('Trung bình');
  const [newProdMeasurements, setNewProdMeasurements] = useState({ chest: '115 cm', length: '65 cm', waist: 'N/A' });
  const [newProdSizes, setNewProdSizes] = useState<string[]>(['M', 'L']);
  const [newProdOneOfOne, setNewProdOneOfOne] = useState(true);
  const [newProdBestSeller, setNewProdBestSeller] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    totalSales: 0,
    ordersCount: 0,
    donationsCount: 0,
    membersCount: 0
  });

  // Load all data from Firestore (real-time) with LocalStorage fallback and real-time synchronization
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    
    setIsLoadingData(true);
    
    // 1. Real-time listener for Orders
    const unsubscribeOrders = onSnapshot(
      collection(db, 'orders'),
      (snapshot) => {
        const firestoreOrders: Order[] = [];
        snapshot.forEach((doc) => {
          firestoreOrders.push(doc.data() as Order);
        });
        
        const savedOrders = localStorage.getItem('echove_orders');
        const localOrders: Order[] = savedOrders ? JSON.parse(savedOrders) : [];
        
        // Merge and uniquely identify by ID
        const unifiedOrders = new Map<string, Order>();
        firestoreOrders.forEach(o => unifiedOrders.set(o.id, o));
        localOrders.forEach(o => {
          if (!unifiedOrders.has(o.id)) {
            unifiedOrders.set(o.id, o);
            // Save local-only ones to firestore
            import('../firebase').then(m => m.createOrder(o));
          }
        });
        
        const orderList = Array.from(unifiedOrders.values()).sort(
          (a, b) => b.id.localeCompare(a.id)
        );
        setOrders(orderList);
        localStorage.setItem('echove_orders', JSON.stringify(orderList));
        
        // Calculate Stats
        const totalSales = orderList
          .filter(o => o.status === 'completed' || o.status === 'shipping' || o.status === 'confirmed')
          .reduce((sum, o) => sum + o.totalPrice, 0);
          
        setStats(prev => ({
          ...prev,
          totalSales,
          ordersCount: orderList.length
        }));
        setIsLoadingData(false);
      },
      (err) => {
        console.error("Error listening to orders real-time:", err);
        setIsLoadingData(false);
      }
    );

    // 2. Real-time listener for Products
    const unsubscribeProducts = onSnapshot(
      collection(db, 'products'),
      (snapshot) => {
        const firestoreProducts: Product[] = [];
        snapshot.forEach((doc) => {
          firestoreProducts.push(doc.data() as Product);
        });
        
        const sortedProducts = firestoreProducts.sort((a, b) => a.id.localeCompare(b.id));
        setProducts(sortedProducts);
        localStorage.setItem('echove_products', JSON.stringify(sortedProducts));
        if (onProductUpdate) {
          onProductUpdate(sortedProducts);
        }
      },
      (err) => {
        console.error("Error listening to products real-time:", err);
      }
    );

    // 3. Real-time listener for Donations
    const unsubscribeDonations = onSnapshot(
      collection(db, 'donations'),
      (snapshot) => {
        const firestoreDonations: DonationSubmission[] = [];
        snapshot.forEach((doc) => {
          firestoreDonations.push(doc.data() as DonationSubmission);
        });
        
        const savedDonations = localStorage.getItem('echove_donations');
        const localDonations: DonationSubmission[] = savedDonations ? JSON.parse(savedDonations) : [];
        
        const unifiedDonations = new Map<string, DonationSubmission>();
        firestoreDonations.forEach(d => unifiedDonations.set(d.id, d));
        localDonations.forEach(d => {
          if (!unifiedDonations.has(d.id)) {
            unifiedDonations.set(d.id, d);
            import('../firebase').then(m => m.createDonation(d));
          }
        });
        
        const donationList = Array.from(unifiedDonations.values()).sort(
          (a, b) => b.id.localeCompare(a.id)
        );
        setDonations(donationList);
        localStorage.setItem('echove_donations', JSON.stringify(donationList));
        
        setStats(prev => ({
          ...prev,
          donationsCount: donationList.length
        }));
      },
      (err) => {
        console.error("Error listening to donations real-time:", err);
      }
    );

    // 4. Real-time listener for Registered Users/Members
    const unsubscribeUsers = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const firestoreUsers: User[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          firestoreUsers.push({
            uid: doc.id,
            email: data.email || '',
            displayName: data.displayName || '',
            photoURL: data.photoURL || undefined,
            providerId: data.providerId || 'password',
            points: data.points || 0,
            role: data.role || 'user',
            phoneNumber: data.phoneNumber || '',
            address: data.address || ''
          } as User);
        });
        
        const defaultMockUsers: User[] = [
          {
            uid: 'social-1',
            email: 'minh.streetwear@gmail.com',
            displayName: 'Minh Streetwear',
            providerId: 'google',
            points: 150,
            role: 'user'
          },
          {
            uid: 'social-2',
            email: 'vy.upcycled@gmail.com',
            displayName: 'Vy Denim',
            providerId: 'instagram',
            points: 240,
            role: 'user'
          },
          {
            uid: 'social-3',
            email: 'hai.vintage@gmail.com',
            displayName: 'Hải Vintage',
            providerId: 'facebook',
            points: 420,
            role: 'user'
          }
        ];
        
        const unifiedMembers = new Map<string, User>();
        defaultMockUsers.forEach(m => unifiedMembers.set(m.email.toLowerCase(), m));
        firestoreUsers.forEach(u => unifiedMembers.set(u.email.toLowerCase(), u));
        
        const memberList = Array.from(unifiedMembers.values());
        setMembers(memberList);
        localStorage.setItem('echove_all_registered_users', JSON.stringify(memberList));
        
        setStats(prev => ({
          ...prev,
          membersCount: memberList.filter(u => u.role !== 'admin').length
        }));
      },
      (err) => {
        console.error("Error listening to users real-time:", err);
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeProducts();
      unsubscribeDonations();
      unsubscribeUsers();
    };
  }, [user]);

  // Load Vouchers and Email logs
  useEffect(() => {
    async function loadVouchersAndEmails() {
      if (!user || user.role !== 'admin') return;
      try {
        const list = await getAllVouchers();
        setVouchers(list);
        
        const logs = await getAllEmailLogs();
        setEmailLogs(logs);
        
        const config = await getEmailConfig();
        setEmailConfig(config);
      } catch (err) {
        console.error("Error loading vouchers or email settings:", err);
      }
    }
    loadVouchersAndEmails();
  }, [user, activeTab]);

  const handleCreateVoucherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoucherId.trim() || !newVoucherDesc.trim()) {
      alert('Vui lòng điền mã và mô tả voucher!');
      return;
    }

    setIsSavingVoucher(true);
    try {
      const voucher: Voucher = {
        id: newVoucherId.toUpperCase().trim(),
        description: newVoucherDesc,
        discountType: newVoucherType,
        discountValue: newVoucherValue,
        minOrderValue: newVoucherMinOrder,
        expiryDate: newVoucherExpiry,
        usageLimit: newVoucherLimit,
        usageCount: 0,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      await createVoucher(voucher);
      setVouchers(prev => [voucher, ...prev]);
      
      // Reset
      setNewVoucherId('');
      setNewVoucherDesc('');
      setNewVoucherValue(50000);
      setNewVoucherMinOrder(200000);
      setNewVoucherLimit(undefined);
      setIsAddVoucherOpen(false);
      alert('Tạo mã voucher thành công trên Firestore! 🎉');
    } catch (err) {
      console.error('Error creating voucher:', err);
      alert('Có lỗi xảy ra khi tạo voucher.');
    } finally {
      setIsSavingVoucher(false);
    }
  };

  const handleDeleteVoucher = async (id: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã giảm giá ${id} này không?`)) return;
    try {
      await deleteVoucher(id);
      setVouchers(prev => prev.filter(v => v.id !== id));
      alert('Xóa voucher thành công!');
    } catch (err) {
      console.error('Error deleting voucher:', err);
      alert('Xóa voucher thất bại.');
    }
  };

  const handleToggleVoucherStatus = async (voucher: Voucher) => {
    try {
      const updatedVoucher = { ...voucher, isActive: !voucher.isActive };
      await createVoucher(updatedVoucher);
      setVouchers(prev => prev.map(v => v.id === voucher.id ? updatedVoucher : v));
    } catch (err) {
      console.error('Error updating voucher status:', err);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingEmailConfig(true);
    try {
      await saveEmailConfig(emailConfig);
      alert('Cấu hình EmailJS đã được cập nhật thành công lên Firestore! 📩');
    } catch (err) {
      console.error('Error saving email config:', err);
      alert('Cấu hình EmailJS thất bại.');
    } finally {
      setIsSavingEmailConfig(false);
    }
  };

  // Save changes to localStorage helper functions
  const saveOrders = (updatedOrders: Order[]) => {
    setOrders(updatedOrders);
    localStorage.setItem('echove_orders', JSON.stringify(updatedOrders));
    
    // Recalculate stats
    const totalSales = updatedOrders
      .filter(o => o.status === 'completed' || o.status === 'shipping' || o.status === 'confirmed')
      .reduce((sum, o) => sum + o.totalPrice, 0);
    setStats(prev => ({ ...prev, totalSales, ordersCount: updatedOrders.length }));
  };

  const saveProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    localStorage.setItem('echove_products', JSON.stringify(updatedProducts));
    if (onProductUpdate) {
      onProductUpdate(updatedProducts);
    }
  };

  const saveDonations = (updatedDonations: DonationSubmission[]) => {
    setDonations(updatedDonations);
    localStorage.setItem('echove_donations', JSON.stringify(updatedDonations));
    setStats(prev => ({ ...prev, donationsCount: updatedDonations.length }));
  };

  const saveMembers = (updatedMembers: User[]) => {
    setMembers(updatedMembers);
    localStorage.setItem('echove_all_registered_users', JSON.stringify(updatedMembers));
    setStats(prev => ({ ...prev, membersCount: updatedMembers.filter(u => u.role !== 'admin').length }));
  };

  // Actions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    saveOrders(updated);

    // Save to Firestore
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error("Error updating order status in Firestore:", err);
    }
  };

  const handleUpdateDonationStatus = async (donationId: string, newStatus: DonationSubmission['status']) => {
    const updated = donations.map(d => {
      if (d.id === donationId) {
        return { ...d, status: newStatus };
      }
      return d;
    });
    saveDonations(updated);

    // Save to Firestore
    try {
      await updateDonationStatus(donationId, newStatus);
    } catch (err) {
      console.error("Error updating donation status in Firestore:", err);
    }
  };

  const handleRewardMemberPoints = async (memberEmail: string, pointsToAdd: number) => {
    const updated = members.map(m => {
      if (m.email.toLowerCase() === memberEmail.toLowerCase()) {
        const currentPoints = m.points || 0;
        return { ...m, points: currentPoints + pointsToAdd };
      }
      return m;
    });
    saveMembers(updated);

    // Update in Firestore
    try {
      await rewardMemberPoints(memberEmail, pointsToAdd);
    } catch (err) {
      console.error("Error rewarding points in Firestore:", err);
    }
    alert(`Đã cộng thành công ${pointsToAdd} PTS cho thành viên ${memberEmail}!`);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm upcycle này không?')) {
      const updated = products.filter(p => p.id !== productId);
      saveProducts(updated);
      try {
        await deleteProduct(productId);
      } catch (err) {
        console.error("Error deleting product from Firestore:", err);
      }
    }
  };

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc) {
      alert('Vui lòng điền đủ tên và mô tả sản phẩm.');
      return;
    }

    const newProd: Product = {
      id: 'echove-custom-' + Math.floor(1000 + Math.random() * 9000),
      name: newProdName,
      price: newProdPrice,
      description: newProdDesc,
      images: newProdImages.length > 0 ? newProdImages : ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=60'],
      category: newProdCategory,
      story: newProdStory || 'Sản phẩm tái sinh sáng tạo thiết kế độc quyền bởi các nghệ nhân ECHOVE Studio dạo phố.',
      originalJeansCount: newProdJeansCount,
      artisanDifficulty: newProdDifficulty,
      measurements: newProdMeasurements,
      sizes: newProdSizes,
      isOneOfOne: newProdOneOfOne,
      isBestSeller: newProdBestSeller
    };

    const updated = [newProd, ...products];
    saveProducts(updated);
    
    try {
      await createProduct(newProd);
    } catch (err) {
      console.error("Error creating product in Firestore:", err);
    }
    
    // Clear Form & Close
    setNewProdName('');
    setNewProdPrice(450000);
    setNewProdDesc('');
    setNewProdStory('');
    setNewProdImages(['https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=60']);
    setNewImageUrlInput('');
    setIsAddProductOpen(false);
    alert('Thêm sản phẩm độc bản mới thành công!');
  };

  const formatPrice = (value: number) => {
    return value.toLocaleString('vi-VN') + ' ₫';
  };

  // Filter Data
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDonations = donations.filter(d => 
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.phone.includes(searchTerm)
  );

  const filteredMembers = members.filter(m => 
    m.displayName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // If user is not admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="inline-flex p-4 bg-red-500/15 text-red-400 border border-red-500/25 rounded-full">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <div className="space-y-2">
          <h2 className="font-display font-black text-3xl uppercase tracking-widest text-white">TRUY CẬP BỊ TỪ CHỐI</h2>
          <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed">
            Khu vực này chỉ dành riêng cho Ban quản trị viên của ECHOVE Studio. Vui lòng đăng nhập bằng tài khoản Admin để tiếp tục.
          </p>
        </div>
        <div className="pt-2">
          <span className="font-mono text-xs text-mustard bg-mustard/10 px-3 py-1.5 border border-mustard/20 rounded-xs uppercase tracking-wider">
            Vui lòng liên hệ nhà phát triển nếu bạn quên mật khẩu quản trị viên.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-white min-h-screen">
      
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 px-3 py-1 rounded-sm text-[10px] font-mono tracking-widest uppercase mb-2">
            <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
            <span>Khu vực Ban Quản Trị ECHOVE</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
            ADMIN DASHBOARD
          </h1>
          <p className="text-white/40 text-xs sm:text-sm font-light mt-1">
            Quản lý đơn hàng dạo phố, chỉnh sửa danh mục sản phẩm tái sinh và phân loại yêu cầu quyên góp denim.
          </p>
        </div>

        {/* Sync Info / Quick Stat Summary */}
        <div className="flex items-center space-x-3 bg-white/5 border border-white/5 p-3 rounded-xs self-start md:self-auto">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
          <div className="font-mono text-xs text-white/60">
            <span>Server: </span>
            <span className="text-white font-bold">LIVE (Cloud Run Container)</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Stat 1: Total Sales */}
        <div className="bg-[#1C1E22] border border-white/10 p-4 sm:p-5 rounded-xs space-y-2">
          <p className="text-[10px] sm:text-xs font-mono uppercase text-white/40 tracking-wider">DOANH THU ƯỚC TÍNH</p>
          <p className="text-xl sm:text-3xl font-black text-mustard font-mono truncate">{formatPrice(stats.totalSales)}</p>
          <div className="flex items-center space-x-1.5 text-[9px] sm:text-xs font-mono text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.5% so với tuần trước</span>
          </div>
        </div>

        {/* Stat 2: Active Orders */}
        <div className="bg-[#1C1E22] border border-white/10 p-4 sm:p-5 rounded-xs space-y-2">
          <p className="text-[10px] sm:text-xs font-mono uppercase text-white/40 tracking-wider">SỐ LƯỢNG ĐƠN HÀNG</p>
          <p className="text-xl sm:text-3xl font-black text-white font-mono">{stats.ordersCount} ĐƠN</p>
          <p className="text-[9px] sm:text-xs font-mono text-white/30 truncate">Tích hợp giỏ hàng & thanh toán COD</p>
        </div>

        {/* Stat 3: Denim donations received */}
        <div className="bg-[#1C1E22] border border-white/10 p-4 sm:p-5 rounded-xs space-y-2">
          <p className="text-[10px] sm:text-xs font-mono uppercase text-white/40 tracking-wider">ĐƠN GỬI JEAN CŨ</p>
          <p className="text-xl sm:text-3xl font-black text-orange-earth font-mono">{stats.donationsCount} PHIẾU</p>
          <p className="text-[9px] sm:text-xs font-mono text-white/30 truncate">Đã kết nối cộng đồng thu gom</p>
        </div>

        {/* Stat 4: Loyalty Members */}
        <div className="bg-[#1C1E22] border border-white/10 p-4 sm:p-5 rounded-xs space-y-2">
          <p className="text-[10px] sm:text-xs font-mono uppercase text-white/40 tracking-wider">THÀNH VIÊN STREET CLUB</p>
          <p className="text-xl sm:text-3xl font-black text-denim-indigo font-mono">{stats.membersCount} BẠN BH</p>
          <p className="text-[9px] sm:text-xs font-mono text-white/30 truncate">Được tích điểm xanh upcycling</p>
        </div>
      </div>

      {/* Tabs Controller & Action Search */}
      <div className="bg-[#1C1E22] border border-white/10 rounded-xs p-4 space-y-4">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap border-b border-white/5 pb-2 gap-1 sm:gap-2">
          <button
            onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs sm:text-sm font-display tracking-widest uppercase transition-colors rounded-xs flex items-center space-x-2 border cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-mustard text-denim-dark border-mustard font-black'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>ĐƠN HÀNG</span>
          </button>

          <button
            onClick={() => { setActiveTab('products'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs sm:text-sm font-display tracking-widest uppercase transition-colors rounded-xs flex items-center space-x-2 border cursor-pointer ${
              activeTab === 'products'
                ? 'bg-mustard text-denim-dark border-mustard font-black'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>SẢN PHẨM</span>
          </button>

          <button
            onClick={() => { setActiveTab('donations'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs sm:text-sm font-display tracking-widest uppercase transition-colors rounded-xs flex items-center space-x-2 border cursor-pointer ${
              activeTab === 'donations'
                ? 'bg-mustard text-denim-dark border-mustard font-black'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>GỬI JEAN CŨ</span>
          </button>

          <button
            onClick={() => { setActiveTab('users'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs sm:text-sm font-display tracking-widest uppercase transition-colors rounded-xs flex items-center space-x-2 border cursor-pointer ${
              activeTab === 'users'
                ? 'bg-mustard text-denim-dark border-mustard font-black'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>THÀNH VIÊN</span>
          </button>

          <button
            onClick={() => { setActiveTab('vouchers'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs sm:text-sm font-display tracking-widest uppercase transition-colors rounded-xs flex items-center space-x-2 border cursor-pointer ${
              activeTab === 'vouchers'
                ? 'bg-mustard text-denim-dark border-mustard font-black'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>VOUCHER</span>
          </button>

          <button
            onClick={() => { setActiveTab('emails'); setSearchTerm(''); }}
            className={`px-4 py-2 text-xs sm:text-sm font-display tracking-widest uppercase transition-colors rounded-xs flex items-center space-x-2 border cursor-pointer ${
              activeTab === 'emails'
                ? 'bg-mustard text-denim-dark border-mustard font-black'
                : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>HỘM THƯ</span>
          </button>
        </div>

        {/* Filters and Inputs bar */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder={
                activeTab === 'orders' ? 'Tìm đơn hàng theo tên, SĐT hoặc mã đơn...' :
                activeTab === 'products' ? 'Tìm sản phẩm theo tên hoặc phân loại...' :
                activeTab === 'donations' ? 'Tìm phiếu gửi đồ theo tên hoặc SĐT...' :
                activeTab === 'vouchers' ? 'Tìm voucher theo mã code...' :
                activeTab === 'emails' ? 'Tìm nhật ký thư theo email nhận...' :
                'Tìm thành viên theo tên hoặc email...'
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0F1012] border border-white/10 text-white pl-10 pr-4 py-2 text-xs sm:text-sm focus:outline-none focus:border-mustard rounded-xs"
            />
          </div>

          {/* Special Action: Status filter for Orders, or Add Button for Products */}
          {activeTab === 'orders' && (
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-white/40 hidden sm:block" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-xs sm:text-sm focus:outline-none rounded-xs font-mono"
              >
                <option value="all">TẤT CẢ TRẠNG THÁI</option>
                <option value="pending">CHỜ XỬ LÝ (PENDING)</option>
                <option value="confirmed">ĐÃ XÁC NHẬN (CONFIRMED)</option>
                <option value="shipping">ĐANG GIAO HÀNG (SHIPPING)</option>
                <option value="completed">HOÀN TẤT (COMPLETED)</option>
              </select>
            </div>
          )}

          {activeTab === 'products' && (
            <button
              onClick={() => setIsAddProductOpen(true)}
              className="bg-orange-earth hover:bg-orange-earth/90 text-white px-4 py-2 text-xs sm:text-sm font-display font-black tracking-widest uppercase flex items-center justify-center space-x-1.5 transition-colors cursor-pointer rounded-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>THÊM SẢN PHẨM</span>
            </button>
          )}

          {activeTab === 'vouchers' && (
            <button
              onClick={() => setIsAddVoucherOpen(true)}
              className="bg-orange-earth hover:bg-orange-earth/90 text-white px-4 py-2 text-xs sm:text-sm font-display font-black tracking-widest uppercase flex items-center justify-center space-x-1.5 transition-colors cursor-pointer rounded-xs self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>TẠO VOUCHER</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Grid View of Selected Tab */}
      <div className="space-y-4">
        
        {/* TAB 1: ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="bg-[#1C1E22] border border-white/10 p-12 text-center text-white/40 text-xs sm:text-sm">
                Không tìm thấy đơn hàng nào khớp với tìm kiếm hoặc bộ lọc.
              </div>
            ) : (
              filteredOrders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-[#1C1E22] border border-white/10 rounded-xs p-4 sm:p-6 space-y-4 hover:border-white/20 transition-all"
                >
                  {/* Top line of Order */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-mustard font-bold tracking-wide text-xs sm:text-sm">{order.id}</span>
                      <span className="text-white/30 font-mono text-[10px] sm:text-xs">|</span>
                      <span className="font-mono text-white/50 text-[10px] sm:text-xs">{order.createdAt}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase hidden sm:inline">Trạng thái:</span>
                      
                      {/* Dynamic status pill */}
                      {order.status === 'pending' && (
                        <span className="bg-amber-500/10 border border-amber-500/35 text-amber-400 font-mono text-[9px] sm:text-xs uppercase px-2 py-0.5 rounded-sm font-bold">Chờ duyệt</span>
                      )}
                      {order.status === 'confirmed' && (
                        <span className="bg-blue-500/10 border border-blue-500/35 text-blue-400 font-mono text-[9px] sm:text-xs uppercase px-2 py-0.5 rounded-sm font-bold">Đã xác nhận</span>
                      )}
                      {order.status === 'shipping' && (
                        <span className="bg-pink-500/10 border border-pink-500/35 text-pink-400 font-mono text-[9px] sm:text-xs uppercase px-2 py-0.5 rounded-sm font-bold">Đang giao</span>
                      )}
                      {order.status === 'completed' && (
                        <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 font-mono text-[9px] sm:text-xs uppercase px-2 py-0.5 rounded-sm font-bold">Hoàn tất</span>
                      )}
                    </div>
                  </div>

                  {/* Customer & Items details */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Buyer Info */}
                    <div className="lg:col-span-4 space-y-2 text-xs sm:text-sm font-sans">
                      <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider">Thông tin người nhận</p>
                      <p className="text-white font-bold">{order.customerName}</p>
                      <p className="text-white/80 font-mono">{order.phone}</p>
                      <p className="text-white/60 font-mono truncate" title={order.email}>{order.email}</p>
                      <p className="text-white/70 leading-normal max-w-xs">{order.address}</p>
                      {order.note && (
                        <div className="bg-white/5 border border-white/5 p-2 rounded-xs text-[11px] font-light text-mustard">
                          📝 Yêu cầu: "{order.note}"
                        </div>
                      )}
                    </div>

                    {/* Bought Items list */}
                    <div className="lg:col-span-5 space-y-2">
                      <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider">Danh sách sản phẩm ({order.items.length})</p>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto pr-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="bg-[#0F1012] border border-white/5 p-2 flex items-center space-x-3 rounded-xs text-xs">
                            <div className="w-8 h-8 rounded-xs bg-denim-dark overflow-hidden shrink-0">
                              <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-semibold truncate uppercase">{item.product.name}</p>
                              <p className="text-white/40 font-mono text-[9px] uppercase">Size: {item.selectedSize} | SL: {item.quantity}</p>
                            </div>
                            <span className="font-mono text-mustard font-semibold shrink-0">{formatPrice(item.product.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Admin Actions for this order */}
                    <div className="lg:col-span-3 bg-[#0F1012] p-4 border border-white/5 rounded-xs flex flex-col justify-between space-y-3">
                      <div>
                        <p className="text-white/40 font-mono text-[10px] uppercase">Tổng tiền đơn</p>
                        <p className="text-lg font-black text-mustard font-mono">{formatPrice(order.totalPrice)}</p>
                        <p className="text-[9px] font-mono text-white/30 uppercase mt-0.5">Thanh toán: COD</p>
                      </div>

                      {/* Status advancement buttons */}
                      <div className="space-y-1.5">
                        <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Cập nhật trạng thái dạo phố</p>
                        
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-display text-[10px] font-bold tracking-widest py-2 rounded-xs transition-colors cursor-pointer text-center uppercase"
                          >
                            Xác nhận đơn hàng
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'shipping')}
                            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-display text-[10px] font-bold tracking-widest py-2 rounded-xs transition-colors cursor-pointer text-center uppercase"
                          >
                            Bắt đầu giao hàng
                          </button>
                        )}
                        {order.status === 'shipping' && (
                          <button
                            onClick={() => handleUpdateOrderStatus(order.id, 'completed')}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display text-[10px] font-bold tracking-widest py-2 rounded-xs transition-colors cursor-pointer text-center uppercase"
                          >
                            Đơn hàng hoàn tất
                          </button>
                        )}
                        {order.status === 'completed' && (
                          <div className="flex items-center justify-center space-x-1 py-1.5 bg-emerald-500/10 text-emerald-400 font-mono text-[10px] rounded-xs border border-emerald-500/20">
                            <Check className="w-3.5 h-3.5" />
                            <span>ĐÃ HOÀN TẤT ĐỒNG BỘ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS CATALOGUE MANAGEMENT */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-[#1C1E22] border border-white/10 rounded-xs overflow-hidden flex flex-col justify-between group hover:border-white/20 transition-all shadow-md">
                {/* Product Banner */}
                <div className="h-44 relative bg-denim-dark border-b border-white/5 overflow-hidden">
                  <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className="bg-black/75 backdrop-blur-md text-white font-mono text-[9px] px-2 py-0.5 rounded-sm uppercase tracking-wider border border-white/10">
                      {p.category}
                    </span>
                    {p.isBestSeller && (
                      <span className="bg-mustard text-denim-dark font-mono text-[9px] px-2 py-0.5 rounded-sm font-black uppercase tracking-wider">
                        BEST
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 text-white rounded-xs transition-colors cursor-pointer"
                    title="Xóa sản phẩm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="font-mono text-white/30 text-[9px] tracking-wide uppercase">{p.id}</span>
                    <h3 className="font-display font-bold text-base text-white tracking-wide uppercase line-clamp-1 group-hover:text-mustard transition-colors">
                      {p.name}
                    </h3>
                    <p className="text-white/50 text-[11px] line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white/40">Gia công:</span>
                      <span className="text-white font-semibold">{p.artisanDifficulty}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-white/40">Số quần tái sinh:</span>
                      <span className="text-orange-earth font-bold">{p.originalJeansCount} chiếc</span>
                    </div>
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-white/40 font-mono text-xs">Giá bán:</span>
                      <span className="text-mustard font-mono font-black text-base">{formatPrice(p.price)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: DONATION REQUESTS */}
        {activeTab === 'donations' && (
          <div className="space-y-4">
            {filteredDonations.length === 0 ? (
              <div className="bg-[#1C1E22] border border-white/10 p-12 text-center text-white/40 text-xs sm:text-sm">
                Chưa có đơn gửi tặng quần jeans cũ nào từ cộng đồng được lưu trữ.
              </div>
            ) : (
              filteredDonations.map((d) => (
                <div key={d.id} className="bg-[#1C1E22] border border-white/10 rounded-xs p-4 sm:p-5 space-y-4 hover:border-white/20 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-orange-earth font-bold text-xs sm:text-sm">{d.id}</span>
                      <span className="text-white/30 font-mono text-[10px]">|</span>
                      <span className="font-mono text-white/50 text-[10px] sm:text-xs">Số lượng: <strong className="text-white">{d.jeansCount} quần jeans</strong></span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono text-white/40 uppercase">Trạng thái:</span>
                      {d.status === 'pending' && (
                        <span className="bg-amber-500/10 border border-amber-500/35 text-amber-400 font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm font-bold">Chờ tiếp nhận</span>
                      )}
                      {d.status === 'received' && (
                        <span className="bg-blue-500/10 border border-blue-500/35 text-blue-400 font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm font-bold">Đã nhận hàng</span>
                      )}
                      {d.status === 'processed' && (
                        <span className="bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm font-bold">Đã tái chế</span>
                      )}
                      {d.status === 'rejected' && (
                        <span className="bg-red-500/10 border border-red-500/35 text-red-400 font-mono text-[10px] uppercase px-2 py-0.5 rounded-sm font-bold">Từ chối</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Donor details */}
                    <div className="lg:col-span-4 space-y-1 text-xs sm:text-sm">
                      <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider">Thông tin người gửi</p>
                      <p className="text-white font-bold">{d.donorName}</p>
                      <p className="text-white/80 font-mono">{d.phone}</p>
                      <p className="text-white/60 font-mono">{d.email}</p>
                      <p className="text-white/70 leading-normal max-w-xs">{d.address}</p>
                    </div>

                    {/* Clothing condition description */}
                    <div className="lg:col-span-5 space-y-2 text-xs">
                      <div>
                        <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider">Tình trạng đồ quyên góp</p>
                        <p className="text-white font-semibold mt-1 font-mono uppercase bg-[#0F1012] px-2 py-1 inline-block rounded-xs border border-white/5">
                          {d.condition === 'like-new' && '✨ Còn mới (Ít sờn rách)'}
                          {d.condition === 'worn-out' && '👖 Cũ mòn tự nhiên'}
                          {d.condition === 'distressed' && '⚡ Rách gối / Bụi bặm'}
                          {d.condition === 'scrap' && '✂️ Chỉ còn mảnh denim vụn'}
                        </p>
                      </div>

                      {d.description && (
                        <div>
                          <p className="text-white/40 font-mono text-[10px] uppercase tracking-wider">Mô tả thêm từ chủ nhân</p>
                          <p className="text-white/80 leading-normal italic bg-[#0F1012]/50 p-2 border border-white/5 rounded-xs mt-0.5">
                            "{d.description}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="lg:col-span-3 bg-[#0F1012] p-4 border border-white/5 rounded-xs flex flex-col justify-between space-y-3">
                      <div>
                        <p className="text-white/40 font-mono text-[9px] uppercase">Hành động của Admin</p>
                        <p className="text-[11px] font-light text-white/60 mt-1 leading-snug">
                          Cập nhật trạng thái bưu kiện thu gom denim hoặc cộng điểm xanh.
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        {d.status === 'pending' && (
                          <div className="space-y-1">
                            <button
                              onClick={() => handleUpdateDonationStatus(d.id, 'received')}
                              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-display text-[10px] font-bold tracking-widest py-1.5 rounded-xs transition-colors cursor-pointer uppercase"
                            >
                              Nhận bưu phẩm
                            </button>
                            <button
                              onClick={() => handleRewardMemberPoints(d.email, d.jeansCount * 50)}
                              className="w-full bg-orange-earth hover:bg-orange-earth/90 text-white font-display text-[10px] font-bold tracking-widest py-1.5 rounded-xs transition-colors cursor-pointer flex items-center justify-center space-x-1 uppercase"
                            >
                              <Coins className="w-3.5 h-3.5" />
                              <span>Cộng {d.jeansCount * 50} PTS</span>
                            </button>
                          </div>
                        )}

                        {d.status === 'received' && (
                          <button
                            onClick={() => handleUpdateDonationStatus(d.id, 'processed')}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-display text-[10px] font-bold tracking-widest py-1.5 rounded-xs transition-colors cursor-pointer uppercase"
                          >
                            Xác nhận đã upcycled
                          </button>
                        )}

                        {d.status === 'processed' && (
                          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2 rounded-xs text-center font-mono text-[10px] font-bold">
                            📦 ĐÃ TÁI SINH THÀNH CÔNG
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: MEMBERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="bg-[#1C1E22] border border-white/10 rounded-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0F1012] font-mono text-[10px] uppercase text-white/40 tracking-wider">
                    <th className="p-4">Nickname</th>
                    <th className="p-4">Địa chỉ Email</th>
                    <th className="p-4">Phương thức liên kết</th>
                    <th className="p-4 text-center">Điểm thành viên</th>
                    <th className="p-4 text-right">Phần thưởng nhanh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredMembers.map((member) => (
                    <tr key={member.uid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xs bg-mustard/20 text-mustard flex items-center justify-center font-display font-black text-xs border border-mustard/30">
                          {member.displayName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-semibold">{member.displayName}</p>
                          {member.role === 'admin' ? (
                            <span className="bg-red-500/15 border border-red-500/35 text-red-400 font-mono text-[8px] uppercase px-1 rounded-sm font-bold">Admin</span>
                          ) : (
                            <span className="bg-white/5 border border-white/10 text-white/50 font-mono text-[8px] uppercase px-1 rounded-sm">Street Club</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-white/70">{member.email}</td>
                      <td className="p-4">
                        <span className="bg-[#0F1012] border border-white/5 px-2.5 py-1 text-[10px] font-mono rounded-full uppercase text-white/60">
                          {member.providerId}
                        </span>
                      </td>
                      <td className="p-4 text-center font-mono font-black text-mustard text-base">
                        {member.points || 0} PTS
                      </td>
                      <td className="p-4 text-right">
                        {member.role !== 'admin' && (
                          <div className="inline-flex space-x-1.5">
                            <button
                              onClick={() => handleRewardMemberPoints(member.email, 50)}
                              className="bg-white/5 hover:bg-mustard hover:text-denim-dark border border-white/10 px-2 py-1 text-[10px] font-mono rounded-xs transition-colors cursor-pointer uppercase"
                            >
                              +50 PTS
                            </button>
                            <button
                              onClick={() => handleRewardMemberPoints(member.email, 100)}
                              className="bg-white/5 hover:bg-mustard hover:text-denim-dark border border-white/10 px-2 py-1 text-[10px] font-mono rounded-xs transition-colors cursor-pointer uppercase"
                            >
                              +100 PTS
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: VOUCHERS MANAGEMENT */}
        {activeTab === 'vouchers' && (
          <div className="bg-[#1C1E22] border border-white/10 rounded-xs overflow-hidden">
            <div className="p-4 bg-[#0F1012] border-b border-white/5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-sm tracking-widest text-white uppercase flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-mustard" />
                  <span>DANH SÁCH MÃ GIẢM GIÁ (FIRESTORE)</span>
                </h3>
                <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">Các mã giảm giá này áp dụng trực tiếp tại giỏ hàng</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0F1012] font-mono text-[10px] uppercase text-white/40 tracking-wider">
                    <th className="p-4">Mã Code</th>
                    <th className="p-4">Mô tả</th>
                    <th className="p-4 text-center">Trị giá</th>
                    <th className="p-4 text-center">Đơn tối thiểu</th>
                    <th className="p-4 text-center">Hạn dùng</th>
                    <th className="p-4 text-center">Đã dùng / Giới hạn</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-white/40 font-mono text-xs uppercase">
                        Chưa có voucher nào được tạo trên hệ thống. Ấn nút "Tạo Voucher" để thêm mới!
                      </td>
                    </tr>
                  ) : (
                    vouchers
                      .filter(v => v.id.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((voucher) => (
                        <tr key={voucher.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="p-4 font-mono font-black text-mustard tracking-wider uppercase text-sm">
                            {voucher.id}
                          </td>
                          <td className="p-4 text-white text-xs max-w-[180px] truncate" title={voucher.description}>
                            {voucher.description}
                          </td>
                          <td className="p-4 text-center font-mono font-bold text-white">
                            {voucher.discountType === 'percentage' ? `${voucher.discountValue}%` : `${voucher.discountValue.toLocaleString('vi-VN')}đ`}
                          </td>
                          <td className="p-4 text-center font-mono text-white/70">
                            {voucher.minOrderValue.toLocaleString('vi-VN')}đ
                          </td>
                          <td className="p-4 text-center font-mono text-white/60">
                            {voucher.expiryDate}
                          </td>
                          <td className="p-4 text-center font-mono text-white/70">
                            {voucher.usageCount} / {voucher.usageLimit !== undefined ? voucher.usageLimit : '∞'}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleVoucherStatus(voucher)}
                              className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] font-mono font-bold uppercase border rounded-full transition-colors cursor-pointer ${
                                voucher.isActive
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                              }`}
                            >
                              {voucher.isActive ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                            </button>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleDeleteVoucher(voucher.id)}
                              className="text-white/40 hover:text-red-400 p-2 hover:bg-white/5 rounded-xs transition-colors"
                              title="Xóa voucher"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: EMAIL CONFIG & LOGS */}
        {activeTab === 'emails' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* EMAILJS CREDENTIALS CONFIG */}
            <div className="bg-[#1C1E22] border border-white/10 rounded-xs p-5 space-y-4 lg:col-span-1 h-fit text-xs">
              <div className="border-b border-white/5 pb-2">
                <h3 className="font-display font-black text-sm tracking-widest text-white uppercase flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-mustard" />
                  <span>CẤU HÌNH EMAILJS</span>
                </h3>
                <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">Kết nối API gửi thư tự động</p>
              </div>

              <form onSubmit={handleSaveEmailConfig} className="space-y-4 font-sans">
                <div className="space-y-1.5">
                  <label className="font-display tracking-wider text-white/70 uppercase text-[10px]">SERVICE ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. service_xxxxxxx"
                    value={emailConfig.serviceId}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, serviceId: e.target.value }))}
                    className="w-full bg-[#0F1012] border border-white/10 px-3 py-2 text-white text-xs font-mono rounded-xs focus:outline-none focus:border-mustard"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-display tracking-wider text-white/70 uppercase text-[10px]">TEMPLATE ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. template_xxxxxxx"
                    value={emailConfig.templateId}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, templateId: e.target.value }))}
                    className="w-full bg-[#0F1012] border border-white/10 px-3 py-2 text-white text-xs font-mono rounded-xs focus:outline-none focus:border-mustard"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-display tracking-wider text-white/70 uppercase text-[10px]">PUBLIC KEY (USER ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. user_xxxxxxxxxxxx"
                    value={emailConfig.publicKey}
                    onChange={(e) => setEmailConfig(prev => ({ ...prev, publicKey: e.target.value }))}
                    className="w-full bg-[#0F1012] border border-white/10 px-3 py-2 text-white text-xs font-mono rounded-xs focus:outline-none focus:border-mustard"
                  />
                </div>

                <div className="flex items-center justify-between py-2 border-y border-white/5">
                  <span className="font-display tracking-wider text-white/70 uppercase text-[10px]">Trạng thái hệ thống</span>
                  <button
                    type="button"
                    onClick={() => setEmailConfig(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                    className="flex items-center focus:outline-none"
                  >
                    {emailConfig.isEnabled ? (
                      <ToggleRight className="w-10 h-10 text-mustard cursor-pointer" />
                    ) : (
                      <ToggleLeft className="w-10 h-10 text-white/30 cursor-pointer" />
                    )}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSavingEmailConfig}
                  className="w-full bg-mustard hover:bg-mustard/90 text-denim-dark font-display font-black tracking-widest py-3 text-xs rounded-xs transition-colors cursor-pointer uppercase"
                >
                  {isSavingEmailConfig ? 'ĐANG LƯU...' : 'LƯU CẤU HÌNH KẾT NỐI'}
                </button>
              </form>
            </div>

            {/* TRANSACTON MAIL LOGS */}
            <div className="bg-[#1C1E22] border border-white/10 rounded-xs overflow-hidden lg:col-span-2 text-xs">
              <div className="p-4 bg-[#0F1012] border-b border-white/5">
                <h3 className="font-display font-black text-sm tracking-widest text-white uppercase flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-mustard" />
                  <span>NHẬT KÝ THƯ GIAO DỊCH (OUTBOX)</span>
                </h3>
                <p className="text-[10px] font-mono text-white/40 mt-1 uppercase">Các email tự động được phát sinh từ hệ thống</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#0F1012] font-mono text-[10px] uppercase text-white/40 tracking-wider">
                      <th className="p-4">Người Nhận</th>
                      <th className="p-4">Email</th>
                      <th className="p-4 text-center">Sự Kiện</th>
                      <th className="p-4 text-center">Kết Quả</th>
                      <th className="p-4 text-center">Thời Gian</th>
                      <th className="p-4 text-right">Chi Tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-white/40 font-mono text-xs uppercase">
                          Chưa phát sinh lượt gửi email giao dịch nào.
                        </td>
                      </tr>
                    ) : (
                      emailLogs
                        .filter(log => log.recipientEmail.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((log) => (
                          <tr key={log.id} className="hover:bg-white/[0.02] transition-colors text-xs">
                            <td className="p-4 text-white font-medium">{log.recipientName}</td>
                            <td className="p-4 font-mono text-white/60">{log.recipientEmail}</td>
                            <td className="p-4 text-center">
                              <span className={`px-2 py-0.5 text-[9px] font-mono rounded-full border ${
                                log.templateType === 'order_confirmation'
                                  ? 'bg-mustard/10 border-mustard/20 text-mustard'
                                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                              }`}>
                                {log.templateType === 'order_confirmation' ? 'ĐƠN HÀNG' : 'GỬI ĐỒ CŨ'}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`font-mono text-[9px] font-bold ${
                                log.status === 'success' ? 'text-emerald-400' : 'text-rose-400'
                              }`}>
                                {log.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4 text-center font-mono text-white/40 text-[10px]">
                              {new Date(log.sentAt).toLocaleString('vi-VN')}
                            </td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => setViewingEmailBody(log.emailBody)}
                                className="text-mustard hover:underline font-mono text-[10px] font-bold uppercase cursor-pointer px-2 py-1 bg-white/5 border border-white/5 rounded-xs"
                              >
                                Xem Thư
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* POPUP MODAL: ADD PRODUCT FORM */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1012]/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-[#1C1E22] border border-white/10 rounded-xs overflow-hidden shadow-2xl p-6 sm:p-8 relative">
            <button
              onClick={() => setIsAddProductOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-4 mb-6">
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">THÊM SẢN PHẨM ĐỘC BẢN</h2>
              <p className="text-white/40 text-xs font-mono uppercase mt-0.5">Xưởng sản xuất tái chế ECHOVE Studio</p>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    placeholder="ví dụ: Áo Gilet Denim Patchwork"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(Number(e.target.value))}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Phân loại hàng *</label>
                  <select
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value as any)}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                  >
                    <option value="outerwear">Áo Khoác (Outerwear)</option>
                    <option value="bottoms">Quần Bò (Bottoms)</option>
                    <option value="accessories">Phụ kiện (Accessories)</option>
                    <option value="handbags">Túi xách (Handbags)</option>
                  </select>
                </div>

                {/* Original Jeans count */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Số quần tái chế *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={newProdJeansCount}
                    onChange={(e) => setNewProdJeansCount(Number(e.target.value))}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                  />
                </div>

                {/* Difficulty level */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Độ khó may thủ công *</label>
                  <select
                    value={newProdDifficulty}
                    onChange={(e) => setNewProdDifficulty(e.target.value)}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                  >
                    <option value="Dễ">Dễ (Dưới 3 tiếng)</option>
                    <option value="Trung bình">Trung bình (Dưới 6 tiếng)</option>
                    <option value="Khó">Khó (6 đến 12 tiếng)</option>
                    <option value="Cực khó">Cực khó (Hơn 12 tiếng)</option>
                  </select>
                </div>
              </div>

              {/* Multi-Image Manager with File Upload and URL Inputs */}
              <div className="space-y-3 bg-[#0F1012]/40 p-3 border border-white/5 rounded-xs">
                <div className="flex justify-between items-center">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider font-bold">Hình ảnh sản phẩm *</label>
                  <span className="text-[9px] font-mono text-white/40 uppercase">Đã thêm {newProdImages.length} ảnh</span>
                </div>

                {/* Thumbnails list */}
                {newProdImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {newProdImages.map((img, index) => (
                      <div key={index} className="relative aspect-square bg-[#0F1012] border border-white/10 rounded-xs group overflow-hidden">
                        <img src={img} alt="Product preview" className="w-full h-full object-cover animate-in fade-in" />
                        <button
                          type="button"
                          onClick={() => setNewProdImages(prev => prev.filter((_, i) => i !== index))}
                          className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-white font-mono text-[9px] font-black uppercase tracking-wider cursor-pointer"
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* URL Input */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Dán URL hình ảnh..."
                    value={newImageUrlInput}
                    onChange={(e) => setNewImageUrlInput(e.target.value)}
                    className="flex-1 bg-[#0F1012] border border-white/10 text-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-mustard rounded-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newImageUrlInput.trim()) {
                        setNewProdImages(prev => [...prev, newImageUrlInput.trim()]);
                        setNewImageUrlInput('');
                      }
                    }}
                    className="bg-white/10 hover:bg-mustard hover:text-denim-dark px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider rounded-xs text-white transition-all cursor-pointer"
                  >
                    Thêm URL
                  </button>
                </div>

                {/* File Upload with Drag & Drop */}
                <div className="relative border border-dashed border-white/20 hover:border-mustard/50 rounded-xs p-3 transition-colors text-center bg-[#0F1012]/50">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = e.target.files;
                      if (!files) return;
                      Array.from(files).forEach((file: any) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          if (typeof reader.result === 'string') {
                            setNewProdImages(prev => [...prev, reader.result as string]);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <p className="text-[10px] font-mono text-white/60 uppercase">
                    Tải ảnh lên trực tiếp từ thiết bị (File)
                  </p>
                  <p className="text-[9px] font-mono text-white/30 uppercase mt-0.5">
                    Click hoặc Kéo thả nhiều file ảnh vào đây
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Mô tả tóm tắt ngắn *</label>
                <textarea
                  required
                  placeholder="Mô tả form dáng, chất liệu denim gốc..."
                  rows={2}
                  value={newProdDesc}
                  onChange={(e) => setNewProdDesc(e.target.value)}
                  className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                />
              </div>

              {/* Story */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Câu chuyện tái sinh (Upcycle Story) *</label>
                <textarea
                  required
                  placeholder="Kể lại hành trình gom góp, ý tưởng ghép nối rã rập của tác phẩm này..."
                  rows={3}
                  value={newProdStory}
                  onChange={(e) => setNewProdStory(e.target.value)}
                  className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Measurements */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Ngang ngực (Chest)</label>
                  <input
                    type="text"
                    value={newProdMeasurements.chest}
                    onChange={(e) => setNewProdMeasurements({ ...newProdMeasurements, chest: e.target.value })}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-mustard rounded-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Chiều dài (Length)</label>
                  <input
                    type="text"
                    value={newProdMeasurements.length}
                    onChange={(e) => setNewProdMeasurements({ ...newProdMeasurements, length: e.target.value })}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-mustard rounded-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Vòng eo (Waist)</label>
                  <input
                    type="text"
                    value={newProdMeasurements.waist}
                    onChange={(e) => setNewProdMeasurements({ ...newProdMeasurements, waist: e.target.value })}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-xs focus:outline-none focus:border-mustard rounded-xs"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newProdOneOfOne}
                    onChange={(e) => setNewProdOneOfOne(e.target.checked)}
                    className="rounded-sm border-white/15 bg-black text-mustard focus:ring-0"
                  />
                  <span className="text-xs text-white/80 font-mono">HÀNG ĐỘC BẢN (1 OF 1)</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={newProdBestSeller}
                    onChange={(e) => setNewProdBestSeller(e.target.checked)}
                    className="rounded-sm border-white/15 bg-black text-mustard focus:ring-0"
                  />
                  <span className="text-xs text-white/80 font-mono">BÁN CHẠY (BEST SELLER)</span>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="border border-white/10 hover:border-white/30 text-white font-display text-sm tracking-widest py-3 transition-colors cursor-pointer rounded-xs text-center uppercase"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  className="bg-mustard hover:bg-mustard/90 text-denim-dark font-display font-black text-sm tracking-widest py-3 transition-all cursor-pointer rounded-xs text-center uppercase"
                >
                  ĐĂNG BÁN SẢN PHẨM
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: CREATE VOUCHER FORM */}
      {isAddVoucherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1012]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#1C1E22] border border-white/10 rounded-xs overflow-hidden shadow-2xl p-6 relative font-sans text-xs">
            <button
              onClick={() => setIsAddVoucherOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-3 mb-5">
              <h2 className="font-display font-black text-xl text-white uppercase tracking-wider flex items-center space-x-2">
                <Tag className="w-5 h-5 text-mustard" />
                <span>TẠO MÃ GIẢM GIÁ MỚI</span>
              </h2>
              <p className="text-white/40 text-[10px] font-mono uppercase mt-0.5">Lưu thông tin trực tiếp vào Firestore</p>
            </div>

            <form onSubmit={handleCreateVoucherSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">MÃ CODE VOUCHER *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. REBORN15"
                  value={newVoucherId}
                  onChange={(e) => setNewVoucherId(e.target.value.toUpperCase())}
                  className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs font-mono uppercase"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">MÔ TẢ CHI TIẾT *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Giảm ngay 15% cho mọi đơn hàng từ 300K"
                  value={newVoucherDesc}
                  onChange={(e) => setNewVoucherDesc(e.target.value)}
                  className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">LOẠI GIẢM GIÁ *</label>
                  <select
                    value={newVoucherType}
                    onChange={(e) => setNewVoucherType(e.target.value as any)}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs"
                  >
                    <option value="fixed">Số tiền mặt cố định (đ)</option>
                    <option value="percentage">Phần trăm chiết khấu (%)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">TRỊ GIÁ GIẢM *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newVoucherValue}
                    onChange={(e) => setNewVoucherValue(Number(e.target.value))}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">ĐƠN TỐI THIỂU (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={newVoucherMinOrder}
                    onChange={(e) => setNewVoucherMinOrder(Number(e.target.value))}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">HẠN SỬ DỤNG *</label>
                  <input
                    type="date"
                    required
                    value={newVoucherExpiry}
                    onChange={(e) => setNewVoucherExpiry(e.target.value)}
                    className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">GIỚI HẠN LƯỢT DÙNG (Để trống nếu vô hạn)</label>
                <input
                  type="number"
                  placeholder="Vô hạn sử dụng"
                  value={newVoucherLimit || ''}
                  onChange={(e) => setNewVoucherLimit(e.target.value ? Number(e.target.value) : undefined)}
                  className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddVoucherOpen(false)}
                  className="border border-white/10 hover:border-white/30 text-white font-display text-xs tracking-widest py-3 transition-colors cursor-pointer rounded-xs uppercase text-center"
                >
                  HỦY BỎ
                </button>
                <button
                  type="submit"
                  disabled={isSavingVoucher}
                  className="bg-mustard hover:bg-mustard/90 text-denim-dark font-display font-black text-xs tracking-widest py-3 transition-all cursor-pointer rounded-xs uppercase text-center"
                >
                  {isSavingVoucher ? 'ĐANG TẠO...' : 'TẠO VOUCHER'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP MODAL: EMAIL LOG BODY VIEWER */}
      {viewingEmailBody && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1012]/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#1C1E22] border border-white/10 rounded-xs overflow-hidden shadow-2xl p-6 relative font-sans">
            <button
              onClick={() => setViewingEmailBody(null)}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-white/10 pb-3 mb-4">
              <h2 className="font-display font-black text-lg text-white uppercase tracking-wider flex items-center space-x-2">
                <Mail className="w-5 h-5 text-mustard" />
                <span>NỘI DUNG THƯ ĐÃ GỬI</span>
              </h2>
              <p className="text-white/40 text-[10px] font-mono uppercase mt-0.5">Nhật ký chi tiết outbox từ hệ thống</p>
            </div>

            <div className="bg-[#0F1012] border border-white/10 p-4 rounded-xs max-h-[50vh] overflow-y-auto text-xs font-mono text-white/80 leading-relaxed whitespace-pre-wrap">
              {viewingEmailBody}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setViewingEmailBody(null)}
                className="bg-white hover:bg-mustard text-denim-dark font-display font-black text-xs tracking-widest px-6 py-2.5 rounded-xs transition-colors cursor-pointer uppercase"
              >
                ĐÓNG LẠI
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

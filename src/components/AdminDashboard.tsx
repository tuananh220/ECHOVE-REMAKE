import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Users, Gift, Layers, Search, Plus, Trash2, 
  CheckCircle, ArrowRight, RefreshCw, Filter, ShieldAlert, 
  ChevronRight, Award, Edit3, X, Coins, Eye, TrendingUp, Check, Play
} from 'lucide-react';
import { Product, Order, DonationSubmission, User } from '../types';
import { PRODUCTS } from '../data';

interface AdminDashboardProps {
  user: User | null;
  onProductUpdate?: (updatedProducts: Product[]) => void;
}

export default function AdminDashboard({ user, onProductUpdate }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'donations' | 'users'>('orders');
  
  // Data States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [donations, setDonations] = useState<DonationSubmission[]>([]);
  const [members, setMembers] = useState<User[]>([]);

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Form states for creating a new product
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState<number>(450000);
  const [newProdCategory, setNewProdCategory] = useState<'outerwear' | 'bottoms' | 'accessories'>('outerwear');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdStory, setNewProdStory] = useState('');
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=60');
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

  // Load all data from LocalStorage
  useEffect(() => {
    // 1. Orders
    const savedOrders = localStorage.getItem('echove_orders');
    const orderData: Order[] = savedOrders ? JSON.parse(savedOrders) : [];
    setOrders(orderData);

    // 2. Products
    const savedProducts = localStorage.getItem('echove_products');
    const productData: Product[] = savedProducts ? JSON.parse(savedProducts) : PRODUCTS;
    setProducts(productData);

    // 3. Donations
    const savedDonations = localStorage.getItem('echove_donations');
    const donationData: DonationSubmission[] = savedDonations ? JSON.parse(savedDonations) : [];
    setDonations(donationData);

    // 4. Members
    const savedUsers = localStorage.getItem('echove_all_registered_users');
    let usersData: User[] = savedUsers ? JSON.parse(savedUsers) : [];
    
    // Add default mock members if empty
    if (usersData.length === 0) {
      usersData = [
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
        },
        {
          uid: 'admin-uid',
          email: 'admin@echove.vn',
          displayName: 'ECHOVE Admin',
          providerId: 'password',
          points: 9999,
          role: 'admin'
        }
      ];
      localStorage.setItem('echove_all_registered_users', JSON.stringify(usersData));
    }
    setMembers(usersData);

    // Calculate Stats
    const totalSales = orderData
      .filter(o => o.status === 'completed' || o.status === 'shipping' || o.status === 'confirmed')
      .reduce((sum, o) => sum + o.totalPrice, 0);

    setStats({
      totalSales,
      ordersCount: orderData.length,
      donationsCount: donationData.length,
      membersCount: usersData.filter(u => u.role !== 'admin').length
    });
  }, []);

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
  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    saveOrders(updated);
  };

  const handleUpdateDonationStatus = (donationId: string, newStatus: DonationSubmission['status']) => {
    const updated = donations.map(d => {
      if (d.id === donationId) {
        return { ...d, status: newStatus };
      }
      return d;
    });
    saveDonations(updated);
  };

  const handleRewardMemberPoints = (memberEmail: string, pointsToAdd: number) => {
    const updated = members.map(m => {
      if (m.email.toLowerCase() === memberEmail.toLowerCase()) {
        const currentPoints = m.points || 0;
        return { ...m, points: currentPoints + pointsToAdd };
      }
      return m;
    });
    saveMembers(updated);
    alert(`Đã cộng thành công ${pointsToAdd} PTS cho thành viên ${memberEmail}!`);
  };

  const handleDeleteProduct = (productId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm upcycle này không?')) {
      const updated = products.filter(p => p.id !== productId);
      saveProducts(updated);
    }
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
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
      images: [newProdImage],
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
    
    // Clear Form & Close
    setNewProdName('');
    setNewProdPrice(450000);
    setNewProdDesc('');
    setNewProdStory('');
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
          <span className="font-mono text-xs text-mustard bg-mustard/10 px-3 py-1.5 border border-mustard/20 rounded-xs">
            Mẹo: Dùng email "admin@echove.vn" hoặc nút Đăng nhập nhanh Admin ở cửa sổ đăng nhập!
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

              {/* Image URL */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Đường dẫn hình ảnh minh họa (URL) *</label>
                <input
                  type="text"
                  required
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="w-full bg-[#0F1012] border border-white/10 text-white px-3 py-2 text-sm focus:outline-none focus:border-mustard rounded-xs font-mono"
                />
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

    </div>
  );
}

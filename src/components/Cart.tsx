import React, { useState, useEffect } from 'react';
import { ShoppingBag, X, Trash2, Plus, Minus, CreditCard, ShieldCheck, Truck, Sparkles, MapPin, CheckCircle, Tag, Check, AlertTriangle } from 'lucide-react';
import { CartItem, Order, User, Voucher } from '../types';
import { createOrder, getAllVouchers, updateVoucherUsage, updateUserProfileDetails } from '../firebase';
import { sendAutomaticEmail } from '../emailService';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, size: string, change: number) => void;
  onRemoveItem: (productId: string, size: string) => void;
  onClearCart: () => void;
  user?: User | null;
}

export default function Cart({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart, user = null }: CartProps) {
  const [isCheckoutState, setIsCheckoutState] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Voucher states
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccessMsg, setVoucherSuccessMsg] = useState('');
  const [isValidatingVoucher, setIsValidatingVoucher] = useState(false);

  // Prefill user details if logged in or from localStorage fallback
  useEffect(() => {
    if (isCheckoutState) {
      if (user) {
        if (!customerName) setCustomerName(user.displayName || localStorage.getItem('echove_last_name') || '');
        if (!email) setEmail(user.email || localStorage.getItem('echove_last_email') || '');
        if (!phone) setPhone(user.phoneNumber || localStorage.getItem('echove_last_phone') || '');
        if (!address) setAddress(user.address || localStorage.getItem('echove_last_address') || '');
      } else {
        // Guest user fallback from localStorage
        if (!customerName) setCustomerName(localStorage.getItem('echove_last_name') || '');
        if (!email) setEmail(localStorage.getItem('echove_last_email') || '');
        if (!phone) setPhone(localStorage.getItem('echove_last_phone') || '');
        if (!address) setAddress(localStorage.getItem('echove_last_address') || '');
      }
    }
  }, [user, isCheckoutState]);

  // Reset confirmation and checkout states when drawer is opened with active items
  useEffect(() => {
    if (isOpen && cartItems.length > 0) {
      setConfirmedOrder(null);
      setIsCheckoutState(false);
    }
  }, [isOpen, cartItems.length]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 0 ? 0 : 0; // FREE SHIP TOÀN QUỐC

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  // Calculate voucher discounts
  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * appliedVoucher.discountValue) / 100);
    } else {
      discountAmount = appliedVoucher.discountValue;
    }
    discountAmount = Math.min(discountAmount, subtotal);
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyVoucher = async () => {
    setVoucherError('');
    setVoucherSuccessMsg('');

    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá nhé!');
      return;
    }

    setIsValidatingVoucher(true);
    try {
      const allVouchers = await getAllVouchers();
      const matched = allVouchers.find(v => v.id.toUpperCase() === voucherCode.trim().toUpperCase());

      if (!matched) {
        setVoucherError('Mã giảm giá này không hợp lệ hoặc đã hết hạn!');
        setAppliedVoucher(null);
        return;
      }

      if (!matched.isActive) {
        setVoucherError('Mã giảm giá này đã tạm ngưng hoạt động!');
        setAppliedVoucher(null);
        return;
      }

      // Check minimum order value
      if (subtotal < matched.minOrderValue) {
        setVoucherError(`Mã này chỉ áp dụng cho đơn từ ${formatPrice(matched.minOrderValue)} trở lên dạo phố ơi!`);
        setAppliedVoucher(null);
        return;
      }

      // Check expiry date
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      if (matched.expiryDate && matched.expiryDate < todayStr) {
        setVoucherError('Mã giảm giá này đã hết hạn rồi!');
        setAppliedVoucher(null);
        return;
      }

      // Check usage limit if applicable
      if (matched.usageLimit && matched.usageCount >= matched.usageLimit) {
        setVoucherError('Mã giảm giá này đã hết lượt sử dụng mất rồi!');
        setAppliedVoucher(null);
        return;
      }

      // All validation checks passed!
      setAppliedVoucher(matched);
      setVoucherSuccessMsg(`Áp dụng thành công: ${matched.description}!`);
    } catch (err) {
      console.error('Error applying voucher:', err);
      setVoucherError('Có lỗi khi kiểm tra mã. Hãy thử lại!');
    } finally {
      setIsValidatingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode('');
    setVoucherSuccessMsg('');
    setVoucherError('');
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName || !phone || !email || !address) {
       alert('Tụi mình cần đầy đủ thông tin tên, số điện thoại và địa chỉ để gửi hàng nhé!');
       return;
    }

    const cleanEmail = email.toLowerCase().trim();

    const newOrder: Order = {
      id: 'ECH-ORD-' + Math.floor(100000 + Math.random() * 900000),
      customerName,
      phone,
      email: cleanEmail,
      address,
      note: note || '',
      items: [...cartItems],
      totalPrice: total,
      originalPrice: appliedVoucher ? subtotal : undefined,
      discountApplied: appliedVoucher ? discountAmount : undefined,
      appliedVoucherCode: appliedVoucher ? appliedVoucher.id : undefined,
      paymentMethod: 'COD',
      status: 'pending',
      createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    // Save details to localStorage for prefill fallback
    localStorage.setItem('echove_last_name', customerName);
    localStorage.setItem('echove_last_phone', phone);
    localStorage.setItem('echove_last_email', cleanEmail);
    localStorage.setItem('echove_last_address', address);

    // Save order in localStorage so they can see order confirmation history
    const existingOrders = localStorage.getItem('echove_orders');
    const ordersList = existingOrders ? JSON.parse(existingOrders) : [];
    localStorage.setItem('echove_orders', JSON.stringify([newOrder, ...ordersList]));

    // Save to Firestore
    try {
      await createOrder(newOrder, user?.uid || undefined);
      if (appliedVoucher) {
        await updateVoucherUsage(appliedVoucher.id);
      }
      if (user?.uid) {
        await updateUserProfileDetails(user.uid, phone, address);
      }
    } catch (err: any) {
      console.error("Error saving order to cloud:", err);
      alert("Hệ thống gặp lỗi khi gửi đơn hàng lên đám mây: " + (err?.message || "Vui lòng kiểm tra kết nối mạng và thử lại nhé!"));
      return; // Stop execution here so checkout doesn't fake a success!
    }

    // Trigger Automatic Email
    try {
      await sendAutomaticEmail('order_confirmation', newOrder.email, newOrder.customerName, newOrder);
    } catch (err) {
      console.error("Error dispatching automatic order email:", err);
    }

    setConfirmedOrder(newOrder);
    onClearCart();
    setIsCheckoutState(false);
    
    // Reset fields
    setCustomerName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNote('');
    setVoucherCode('');
    setAppliedVoucher(null);
    setVoucherSuccessMsg('');
    setVoucherError('');
  };

  const handleClose = () => {
    setConfirmedOrder(null);
    setIsCheckoutState(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-xs transition-opacity" 
        onClick={handleClose}
      ></div>

      {/* Cart Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-denim-dark border-l border-white/10 text-white flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="px-4 sm:px-6 py-6 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-display font-black text-2xl tracking-widest uppercase flex items-center space-x-2">
              <ShoppingBag className="w-6 h-6 text-mustard" />
              <span>{confirmedOrder ? 'ĐẶT HÀNG THÀNH CÔNG' : isCheckoutState ? 'THỦ TỤC THANH TOÁN' : 'GIỎ HÀNG CỦA BẠN'}</span>
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-white/60 hover:text-mustard hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
            
            {/* Case 1: Order Confirmed State */}
            {confirmedOrder ? (
              <div className="space-y-6 text-center py-6 animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto scale-110">
                  <CheckCircle className="w-10 h-10 stroke-[1.5]" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-display font-black text-2xl tracking-wide uppercase text-mustard">MUA HÀNG THÀNH CÔNG!</h3>
                  <p className="font-sans text-xs sm:text-sm text-white/70">
                    Cảm ơn bạn đã lựa chọn thời trang upcycled của ECHOVE. Quyết định mua hàng của bạn đã giúp kéo dài vòng đời dệt may thêm nhiều năm! 🌱🤘
                  </p>
                </div>

                {/* Receipt Details Box */}
                <div className="bg-ash-dark/40 border border-white/5 rounded-xs p-4 text-left text-xs font-mono space-y-2.5">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Mã đơn hàng:</span>
                    <span className="text-mustard font-bold">{confirmedOrder.id}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Người nhận:</span>
                    <span className="text-white">{confirmedOrder.customerName}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Số điện thoại:</span>
                    <span className="text-white">{confirmedOrder.phone}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Địa chỉ giao:</span>
                    <span className="text-white leading-normal text-right max-w-[200px] block">{confirmedOrder.address}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-white/40">Phương thức:</span>
                    <span className="text-emerald-400 font-bold">COD (Thanh toán khi nhận)</span>
                  </div>
                  {confirmedOrder.originalPrice && (
                    <>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span className="text-white/40">Tạm tính:</span>
                        <span className="text-white/70 line-through">{formatPrice(confirmedOrder.originalPrice)}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2 text-rose-400 font-bold">
                        <span>Voucher ({confirmedOrder.appliedVoucherCode}):</span>
                        <span>-{formatPrice(confirmedOrder.discountApplied || 0)}</span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-1 font-bold text-sm">
                    <span className="text-mustard uppercase font-display text-lg tracking-wide">TỔNG CỘNG:</span>
                    <span className="text-mustard font-sans text-lg">{formatPrice(confirmedOrder.totalPrice)}</span>
                  </div>
                </div>

                <div className="text-xs text-white/40 leading-relaxed italic bg-white/5 p-3 rounded-xs border border-white/10">
                  ⚡ ECHOVE sẽ gọi điện xác minh số điện thoại đơn hàng trong vòng 24h trước khi gửi hàng dạo phố nhé!
                </div>

                <button
                  onClick={handleClose}
                  className="w-full bg-white hover:bg-mustard text-denim-dark font-display text-lg tracking-widest py-3 font-bold transition-all duration-200 rounded-xs cursor-pointer uppercase"
                >
                  TIẾP TỤC KHÁM PHÁ CỬA HÀNG
                </button>
              </div>
            ) : isCheckoutState ? (
              /* Case 2: Checkout Form State */
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                <div className="border-b border-white/10 pb-3">
                  <h3 className="font-display font-bold text-lg text-white tracking-widest uppercase">THÔNG TIN GIAO HÀNG</h3>
                  <p className="text-[10px] text-white/40 font-mono uppercase mt-0.5">Vui lòng điền đúng để shipper giao chính xác nha</p>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/70 uppercase">Tên người nhận *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/70 uppercase">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="09xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/70 uppercase">Email nhận hóa đơn *</label>
                  <input
                    type="email"
                    required
                    placeholder="nhan_hoa_don@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                  />
                </div>

                {/* Address */}
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/70 uppercase">Địa chỉ nhận hàng *</label>
                  <input
                    type="text"
                    required
                    placeholder="Số nhà, Tên đường, Quận, Tỉnh/Thành phố"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                  />
                </div>

                {/* Note */}
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/70 uppercase">Lời nhắn / Yêu cầu thêm (nếu có)</label>
                  <textarea
                    placeholder="Ví dụ: Giao ngoài giờ hành chính, bọc kỹ vì mình mang đi tặng bạn nha..."
                    rows={2}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2 text-sm text-white focus:outline-none focus:border-mustard font-sans resize-none"
                  />
                </div>

                {/* Info Block on Payment */}
                <div className="bg-ash-dark/40 border border-white/5 rounded-xs p-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <CreditCard className="w-4 h-4" />
                    <span className="font-display font-bold uppercase tracking-wider">COD (Thanh toán khi nhận hàng)</span>
                  </div>
                  <p className="font-sans text-white/60 leading-normal">
                    Để thuận tiện nhất và bảo mật thông tin, tụi mình áp dụng phương thức COD đồng giá miễn phí vận chuyển trên toàn quốc. Bạn được kiểm tra hàng thỏa thích trước khi trả tiền cho bưu tá nha.
                  </p>
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutState(false)}
                    className="w-1/3 bg-transparent hover:bg-white/5 border border-white/10 text-white/70 font-display text-base tracking-widest py-3 rounded-xs transition-colors"
                  >
                    QUAY LẠI
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 bg-orange-earth hover:bg-orange-earth/90 text-white font-display text-base tracking-widest py-3 font-bold rounded-xs transition-colors uppercase cursor-pointer"
                  >
                    HOÀN TẤT ĐẶT HÀNG
                  </button>
                </div>
              </form>
            ) : cartItems.length === 0 ? (
              /* Case 3: Empty Cart */
              <div className="text-center py-20 space-y-4">
                <div className="inline-flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-full text-white/40">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <p className="font-display font-bold text-xl uppercase tracking-wider text-white">Giỏ hàng rỗng</p>
                  <p className="font-sans text-xs text-white/40">Bạn chưa thêm món độc bản nào vào giỏ cả.</p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-mustard text-denim-dark font-display text-base tracking-widest px-6 py-2.5 rounded-xs font-bold transition-all duration-200 cursor-pointer hover:bg-mustard/90"
                >
                  ĐI DẠO PHỐ MUA SẮM
                </button>
              </div>
            ) : (
              /* Case 4: Cart Items List */
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div 
                    key={`${item.product.id}-${item.selectedSize}`}
                    className="flex bg-ash-dark/30 border border-white/10 p-3 items-center space-x-4 rounded-xs text-xs sm:text-sm"
                  >
                    {/* Item Image */}
                    <div className="w-16 h-16 bg-denim-light shrink-0 border border-white/5 rounded-xs overflow-hidden">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 space-y-1 min-w-0">
                      <h4 className="font-display font-bold text-base tracking-wide text-white truncate uppercase">
                        {item.product.name}
                      </h4>
                      <p className="font-mono text-[10px] text-white/40 uppercase">Size: {item.selectedSize}</p>
                      <p className="font-mono text-mustard font-semibold">{formatPrice(item.product.price)}</p>
                    </div>

                    {/* Actions and Qty */}
                    <div className="flex flex-col items-end justify-between space-y-2 shrink-0">
                      <button
                        onClick={() => onRemoveItem(item.product.id, item.selectedSize)}
                        className="text-white/40 hover:text-orange-earth p-1"
                        title="Xóa sản phẩm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center space-x-2 bg-denim-dark border border-white/10 px-2 py-0.5 rounded-xs">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, -1)}
                          className="p-0.5 text-white/60 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono font-bold text-xs text-white min-w-[14px] text-center">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.selectedSize, 1)}
                          className="p-0.5 text-white/60 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer (Price calculations, shipping details) */}
          {!confirmedOrder && cartItems.length > 0 && (
            <div className="px-4 sm:px-6 py-6 border-t border-white/10 bg-ash-dark/20 space-y-4">
              
              {/* Calculations */}
              <div className="space-y-2.5 text-sm font-mono">
                <div className="flex justify-between text-white/70">
                  <span>Tạm tính:</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                {/* VOUCHER FIELD */}
                <div className="py-2 border-y border-white/5 space-y-2">
                  <div className="flex items-center space-x-1 text-white/50 text-[10px] uppercase tracking-wider font-display">
                    <Tag className="w-3.5 h-3.5 text-mustard" />
                    <span>Mã Giảm Giá / Voucher</span>
                  </div>
                  
                  {!appliedVoucher ? (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Nhập mã (e.g. REBORN10)"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                        className="flex-1 bg-denim-dark border border-white/10 px-3 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-mustard font-mono"
                      />
                      <button
                        type="button"
                        disabled={isValidatingVoucher}
                        onClick={handleApplyVoucher}
                        className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-4 py-1.5 text-xs font-display tracking-wider font-bold transition-colors cursor-pointer rounded-xs"
                      >
                        {isValidatingVoucher ? '...' : 'ÁP DỤNG'}
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xs">
                      <div className="flex items-center space-x-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-mono font-bold text-xs text-emerald-400 uppercase tracking-wider leading-none">{appliedVoucher.id}</p>
                          <p className="font-sans text-[10px] text-white/60 truncate mt-1 leading-none">{appliedVoucher.description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveVoucher}
                        className="text-white/40 hover:text-red-400 text-xs font-mono font-bold px-2 py-1 hover:bg-white/5 rounded-xs"
                      >
                        Gỡ
                      </button>
                    </div>
                  )}

                  {voucherError && (
                    <div className="flex items-center space-x-1.5 text-rose-400 text-[10px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{voucherError}</span>
                    </div>
                  )}

                  {voucherSuccessMsg && (
                    <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px]">
                      <Check className="w-3.5 h-3.5" />
                      <span>{voucherSuccessMsg}</span>
                    </div>
                  )}
                </div>

                {appliedVoucher && (
                  <div className="flex justify-between text-rose-400">
                    <span>Voucher giảm giá ({appliedVoucher.id}):</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-white/70">
                  <span>Phí vận chuyển:</span>
                  <span className="text-emerald-400 font-bold">MIỄN PHÍ</span>
                </div>
                <hr className="border-white/5" />
                <div className="flex justify-between text-base">
                  <span className="font-display uppercase tracking-widest text-lg font-bold text-white">TỔNG THANH TOÁN:</span>
                  <span className="text-mustard font-bold text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Secure note */}
              <div className="flex items-center justify-center space-x-1.5 text-[10px] font-mono text-white/40">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Thanh toán COD khi nhận hàng an tâm 100%.</span>
              </div>

              {/* Checkout Action Button */}
              {!isCheckoutState ? (
                <button
                  onClick={() => setIsCheckoutState(true)}
                  className="w-full bg-mustard hover:bg-mustard/90 text-denim-dark font-display text-lg tracking-widest py-3.5 font-bold transition-all duration-300 rounded-xs cursor-pointer shadow-lg active:scale-98 uppercase"
                  id="cart-checkout-btn"
                >
                  TIẾP TỤC THANH TOÁN
                </button>
              ) : null}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

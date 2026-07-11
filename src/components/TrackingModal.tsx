import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Gift, Truck, CheckCircle, PackageCheck, RefreshCw, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { Order, DonationSubmission, User } from '../types';
import { getUserOrders, getUserDonations, updateOrderStatus } from '../firebase';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export default function TrackingModal({ isOpen, onClose, user }: TrackingModalProps) {
  const [activeTab, setActiveTab] = useState<'orders' | 'donations'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [donations, setDonations] = useState<DonationSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cancellation States
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelReasonOption, setCancelReasonOption] = useState<string>('Thay đổi ý định / Muốn mua sản phẩm khác');
  const [customCancelReason, setCustomCancelReason] = useState<string>('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleCancelOrder = async (orderId: string) => {
    const finalReason = cancelReasonOption === 'Lý do khác...' 
      ? (customCancelReason.trim() || 'Lý do khác') 
      : cancelReasonOption;
      
    setIsSubmittingCancel(true);
    try {
      await updateOrderStatus(orderId, 'cancelled', {
        reason: finalReason,
        cancelledBy: 'user',
        cancelledAt: new Date().toISOString()
      });
      
      // Update local state
      setOrders(prev => prev.map(o => {
        if (o.id === orderId) {
          return {
            ...o,
            status: 'cancelled',
            cancelReason: finalReason,
            cancelledBy: 'user',
            cancelledAt: new Date().toISOString()
          };
        }
        return o;
      }));
      
      setCancellingOrderId(null);
      setCustomCancelReason('');
      alert('Đã hủy đơn hàng thành công! 😔');
    } catch (err: any) {
      console.error('Lỗi khi hủy đơn hàng:', err);
      alert('Không thể hủy đơn hàng lúc này: ' + (err?.message || 'Lỗi mạng'));
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  useEffect(() => {
    async function loadTrackingData() {
      if (!isOpen || !user || !user.email) return;
      setIsLoading(true);
      try {
        const [fetchedOrders, fetchedDonations] = await Promise.all([
          getUserOrders(user.email),
          getUserDonations(user.email)
        ]);
        setOrders(fetchedOrders);
        setDonations(fetchedDonations);
      } catch (error) {
        console.error("Error loading tracking data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadTrackingData();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const getOrderStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Đang chờ xử lý';
      case 'confirmed': return 'Đã xác nhận đơn';
      case 'shipping': return 'Đang giao hàng';
      case 'completed': return 'Giao hàng thành công';
      case 'cancelled': return 'Đã hủy đơn';
      default: return status;
    }
  };

  const getDonationStatusLabel = (status: DonationSubmission['status']) => {
    switch (status) {
      case 'pending': return 'Chờ gọi xác nhận';
      case 'shipping': return 'Đang lấy quần cũ';
      case 'received': return 'ECHOVE Lab đã nhận';
      case 'processed': return 'Đã phân loại / Hồi sinh';
      case 'rejected': return 'Không đủ điều kiện';
      default: return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="bg-denim-light border border-white/10 w-full max-w-2xl rounded-xs p-6 relative z-10 text-white shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="border-b border-white/10 pb-4 mb-6">
          <h2 className="font-display font-black text-2xl tracking-wider uppercase flex items-center space-x-2">
            <Truck className="w-6 h-6 text-mustard" />
            <span>THEO DÕI HÀNH TRÌNH</span>
          </h2>
          <p className="text-white/40 font-mono text-[11px] uppercase tracking-widest mt-1">
            Tra cứu đơn hàng & trạng thái quần jeans quyên góp của bạn
          </p>
        </div>

        {/* Tabs switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-black/45 border border-white/5 rounded-xs mb-6 font-display text-sm tracking-widest uppercase">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3 flex items-center justify-center space-x-2 rounded-xs transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-mustard text-denim-dark font-black' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>ĐƠN MUA HÀNG ({orders.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('donations')}
            className={`py-3 flex items-center justify-center space-x-2 rounded-xs transition-all cursor-pointer ${
              activeTab === 'donations' 
                ? 'bg-mustard text-denim-dark font-black' 
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Gift className="w-4 h-4 shrink-0" />
            <span>ĐỒ QUYÊN GÓP ({donations.length})</span>
          </button>
        </div>

        {/* Content area */}
        {isLoading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center space-y-4">
            <RefreshCw className="w-8 h-8 text-mustard animate-spin" />
            <p className="font-mono text-xs text-white/40 uppercase tracking-widest">ĐANG LIÊN KẾT DỮ LIỆU ĐÁM MÂY...</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            
            {/* 1. Orders List */}
            {activeTab === 'orders' && (
              orders.length === 0 ? (
                <div className="text-center py-12 bg-ash-dark/15 border border-white/5 p-6 rounded-xs space-y-3">
                  <AlertCircle className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="font-sans text-xs text-white/40 italic">Chưa tìm thấy đơn hàng nào thuộc email của bạn.</p>
                  <p className="font-sans text-xs text-mustard">Khi mua đồ dạo phố, hãy dùng email {user?.email} để đồng bộ nhé!</p>
                </div>
              ) : (
                orders.map((order) => {
                  const isPending = order.status === 'pending';
                  const isConfirmed = order.status === 'confirmed';
                  const isShipping = order.status === 'shipping';
                  const isCompleted = order.status === 'completed';

                  return (
                    <div key={order.id} className="bg-ash-dark/25 border border-white/5 p-4 rounded-xs space-y-3">
                      {/* Order info header */}
                      <div className="flex justify-between items-start border-b border-white/5 pb-2">
                        <div>
                          <p className="font-mono font-black text-mustard text-sm">{order.id}</p>
                          <p className="text-[10px] text-white/40 font-mono">{order.createdAt}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-semibold text-white/95">{formatPrice(order.totalPrice)}</p>
                          <p className="text-[9px] font-mono text-white/40">Phương thức: {order.paymentMethod}</p>
                        </div>
                      </div>

                      {/* Items preview */}
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-xs text-white/70 font-light">
                            <span className="truncate max-w-[320px]">{item.product.name} (Size: {item.selectedSize})</span>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Timeline Visualizer or Cancellation info */}
                      {order.status === 'cancelled' ? (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xs text-xs space-y-1.5 mt-3">
                          <div className="flex items-center space-x-1.5 text-red-400 font-bold uppercase tracking-wider text-[10px]">
                            <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
                            <span>Đơn hàng đã bị hủy</span>
                          </div>
                          <p className="text-white/80 text-[11px]">
                            <span className="text-white/40">Người hủy:</span>{' '}
                            {order.cancelledBy === 'admin' ? 'Ban Điều Hành (Admin)' : 'Bạn (Khách hàng)'}
                          </p>
                          {order.cancelReason && (
                            <p className="text-white/80 text-[11px] leading-relaxed">
                              <span className="text-white/40">Lý do hủy:</span> {order.cancelReason}
                            </p>
                          )}
                          {order.cancelledAt && (
                            <p className="text-white/30 text-[9px] font-mono">
                              Thời gian hủy: {new Date(order.cancelledAt).toLocaleString('vi-VN')}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="pt-3 border-t border-white/5 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">TRẠNG THÁI GIAO HÀNG</span>
                            <span className="bg-mustard/15 text-mustard border border-mustard/20 px-2 py-0.5 font-mono text-[10px] font-bold rounded-xs uppercase">
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </div>

                          {/* Interactive Steps progress bar */}
                          <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 font-mono">
                            <div className="flex flex-col items-center">
                              <CheckCircle className="w-4 h-4 text-emerald-400 mb-1 shrink-0" />
                              <span className="text-emerald-400 font-bold">Đặt mua</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <CheckCircle className={`w-4 h-4 mb-1 shrink-0 ${isConfirmed || isShipping || isCompleted ? 'text-emerald-400' : 'text-white/20'}`} />
                              <span className={isConfirmed || isShipping || isCompleted ? 'text-emerald-400 font-bold' : 'text-white/20'}>Xác nhận</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <Truck className={`w-4 h-4 mb-1 shrink-0 ${isShipping || isCompleted ? 'text-emerald-400' : 'text-white/20'}`} />
                              <span className={isShipping || isCompleted ? 'text-emerald-400 font-bold' : 'text-white/20'}>Đang giao</span>
                            </div>
                            
                            <div className="flex flex-col items-center">
                              <PackageCheck className={`w-4 h-4 mb-1 shrink-0 ${isCompleted ? 'text-emerald-400' : 'text-white/20'}`} />
                              <span className={isCompleted ? 'text-emerald-400 font-bold' : 'text-white/20'}>Đã nhận</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Cancel order interactive form */}
                      {order.status === 'pending' && cancellingOrderId !== order.id && (
                        <div className="flex justify-end pt-2 border-t border-white/5">
                          <button
                            onClick={() => {
                              setCancellingOrderId(order.id);
                              setCancelReasonOption('Thay đổi ý định / Muốn mua sản phẩm khác');
                              setCustomCancelReason('');
                            }}
                            className="text-[10px] uppercase font-mono tracking-wider bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/15 px-3 py-1.5 rounded-xs transition-all cursor-pointer"
                          >
                            Hủy đơn hàng
                          </button>
                        </div>
                      )}

                      {cancellingOrderId === order.id && (
                        <div className="bg-black/35 border border-white/10 p-3.5 rounded-xs space-y-3 text-xs mt-3">
                          <p className="font-mono text-mustard font-black text-[10px] uppercase tracking-wider">
                            Yêu cầu hủy đơn hàng
                          </p>
                          <div className="space-y-1.5">
                            <label className="text-white/50 text-[10px] uppercase tracking-wider">Chọn lý do hủy:</label>
                            <select
                              value={cancelReasonOption}
                              onChange={(e) => setCancelReasonOption(e.target.value)}
                              className="w-full bg-denim-dark border border-white/10 text-white rounded-xs p-1.5 text-xs focus:outline-none focus:border-mustard"
                            >
                              <option value="Thay đổi ý định / Muốn mua sản phẩm khác">Thay đổi ý định / Muốn mua sản phẩm khác</option>
                              <option value="Nhập sai thông tin giao hàng / Số điện thoại">Nhập sai thông tin giao hàng / Số điện thoại</option>
                              <option value="Thời gian giao hàng dự kiến quá lâu">Thời gian giao hàng dự kiến quá lâu</option>
                              <option value="Lý do khác...">Lý do khác...</option>
                            </select>
                          </div>

                          {cancelReasonOption === 'Lý do khác...' && (
                            <div className="space-y-1.5">
                              <label className="text-white/50 text-[10px] uppercase tracking-wider">Chi tiết lý do khác:</label>
                              <textarea
                                value={customCancelReason}
                                onChange={(e) => setCustomCancelReason(e.target.value)}
                                placeholder="Nhập lý do cụ thể của bạn..."
                                rows={2}
                                className="w-full bg-denim-dark border border-white/10 text-white rounded-xs p-2 text-xs focus:outline-none focus:border-mustard"
                              />
                            </div>
                          )}

                          <div className="flex justify-end space-x-2 pt-1">
                            <button
                              onClick={() => setCancellingOrderId(null)}
                              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-[10px] uppercase font-mono tracking-wider rounded-xs cursor-pointer"
                              disabled={isSubmittingCancel}
                            >
                              Quay lại
                            </button>
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-[10px] uppercase font-mono tracking-wider rounded-xs cursor-pointer font-bold"
                              disabled={isSubmittingCancel || (cancelReasonOption === 'Lý do khác...' && !customCancelReason.trim())}
                            >
                              {isSubmittingCancel ? 'Đang hủy...' : 'Hủy đơn hàng'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )
            )}

            {/* 2. Donations List */}
            {activeTab === 'donations' && (
              donations.length === 0 ? (
                <div className="text-center py-12 bg-ash-dark/15 border border-white/5 p-6 rounded-xs space-y-3">
                  <AlertCircle className="w-8 h-8 text-white/30 mx-auto" />
                  <p className="font-sans text-xs text-white/40 italic">Chưa tìm thấy phiếu quyên góp vải jean cũ nào thuộc email của bạn.</p>
                  <p className="font-sans text-xs text-mustard">Bấm sang tab "THU GOM DENIM" để gửi chiếc jean cũ đầu tiên nha dạo phố ơi! 🌿</p>
                </div>
              ) : (
                donations.map((donation) => {
                  const isPending = donation.status === 'pending';
                  const isShipping = donation.status === 'shipping';
                  const isReceived = donation.status === 'received' || donation.status === 'processed';
                  const isProcessed = donation.status === 'processed';

                  return (
                    <div key={donation.id} className="bg-ash-dark/25 border border-white/5 p-4 rounded-xs space-y-3">
                      {/* Donation header */}
                      <div className="flex justify-between items-start border-b border-white/5 pb-2">
                        <div>
                          <p className="font-mono font-black text-orange-earth text-sm">{donation.id}</p>
                          <p className="text-[10px] text-white/40 font-mono">{donation.createdAt}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-mono font-black text-mustard">{donation.jeansCount} QUẦN JEANS</p>
                          <p className="text-[9px] text-white/40 font-sans italic">{donation.donorName}</p>
                        </div>
                      </div>

                      {/* Suggested Upcycle output */}
                      <div className="bg-white/5 p-2.5 rounded-xs border border-white/5 text-xs text-white/80 space-y-1">
                        <p className="text-[10px] font-mono font-bold uppercase text-mustard flex items-center space-x-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Hành trình tái sinh dự kiến:</span>
                        </p>
                        <p className="font-light leading-relaxed">{donation.suggestedOutput}</p>
                      </div>

                      {/* Timeline Visualizer */}
                      <div className="pt-3 border-t border-white/5 space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">QUY TRÌNH HỒI SINH</span>
                          <span className="bg-orange-earth/20 text-orange-earth border border-orange-earth/30 px-2 py-0.5 font-mono text-[10px] font-bold rounded-xs uppercase">
                            {getDonationStatusLabel(donation.status)}
                          </span>
                        </div>

                        {/* Timeline Steps */}
                        <div className="grid grid-cols-4 gap-1 text-[10px] text-center pt-1 font-mono">
                          <div className="flex flex-col items-center">
                            <CheckCircle className="w-4 h-4 text-emerald-400 mb-1 shrink-0" />
                            <span className="text-emerald-400 font-bold">Phiếu gửi</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <Truck className={`w-4 h-4 mb-1 shrink-0 ${isShipping || isReceived || isProcessed ? 'text-emerald-400' : 'text-white/20'}`} />
                            <span className={isShipping || isReceived || isProcessed ? 'text-emerald-400 font-bold' : 'text-white/20'}>Lấy hàng</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <PackageCheck className={`w-4 h-4 mb-1 shrink-0 ${isReceived || isProcessed ? 'text-emerald-400' : 'text-white/20'}`} />
                            <span className={isReceived || isProcessed ? 'text-emerald-400 font-bold' : 'text-white/20'}>Lab nhận</span>
                          </div>
                          
                          <div className="flex flex-col items-center">
                            <Sparkles className={`w-4 h-4 mb-1 shrink-0 ${isProcessed ? 'text-emerald-400' : 'text-white/20'}`} />
                            <span className={isProcessed ? 'text-emerald-400 font-bold' : 'text-white/20'}>BST Reborn</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )
            )}

          </div>
        )}

        {/* Footer info banner */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-2 text-[11px] text-white/50">
          <Clock className="w-4 h-4 text-mustard shrink-0 animate-pulse" />
          <span>ECHOVE Cloud sync tự động đồng bộ hóa trạng thái mới nhất từ Ban Điều Hành.</span>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Layers, ShieldCheck, HelpCircle, Hammer } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, size: string) => void;
}

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<boolean>(false);

  // Set default state when product changes
  useEffect(() => {
    if (product) {
      setSelectedImage(product.images[0]);
      setSelectedSize(product.sizes[0] || 'Freesize');
      setSuccessMessage(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const handleAddToCart = () => {
    onAddToCart(product, selectedSize);
    setSuccessMessage(true);
    setTimeout(() => {
      setSuccessMessage(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-xs transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Positioner */}
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-6 lg:p-10">
        <div className="relative transform overflow-hidden bg-denim-dark border border-white/10 text-left shadow-2xl transition-all my-8 w-full max-w-5xl rounded-xs text-white">
          
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 text-white/70 hover:text-mustard hover:bg-white/5 rounded-full transition-colors cursor-pointer"
            id="modal-close-btn"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
            
            {/* Column 1: Image Gallery (5 Columns on Medium+) */}
            <div className="md:col-span-6 bg-ash-dark/30 p-4 sm:p-6 flex flex-col justify-between border-r border-white/10">
              
              {/* Big Display Image */}
              <div className="relative aspect-square bg-denim-light flex items-center justify-center overflow-hidden border border-white/5 rounded-xs">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                
                {/* 1-of-1 badge */}
                {product.isOneOfOne && (
                  <span className="absolute bottom-3 left-3 bg-orange-earth text-white font-display text-xs tracking-wider uppercase px-2.5 py-1 rotate-[-2deg] border border-white/10 font-bold">
                    Độc bản (1-of-1)
                  </span>
                )}
              </div>

              {/* Thumbnails list */}
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 bg-denim-light flex-shrink-0 border rounded-xs overflow-hidden cursor-pointer ${
                      selectedImage === img ? 'border-mustard ring-2 ring-mustard/30' : 'border-white/10 hover:border-white/40'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>

            </div>

            {/* Column 2: Info & Details (6 Columns on Medium+) */}
            <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-6">
                
                {/* Title & Metadata */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-white/5 border border-white/10 text-white/50 text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-xs">
                      {product.category}
                    </span>
                    <span className="text-mustard font-mono text-xs">
                      Craft Difficulty: {product.artisanDifficulty}
                    </span>
                  </div>
                  
                  <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-tight uppercase">
                    {product.name}
                  </h1>
                  
                  <div className="flex items-baseline space-x-4 pt-1">
                    <span className="font-mono text-2xl sm:text-3xl font-bold text-mustard">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-white/40 text-xs font-mono uppercase tracking-widest">
                      COD Only / FREE SHIP TOÀN QUỐC
                    </span>
                  </div>
                </div>

                <hr className="border-white/10" />

                {/* Craft Stats / Upcycle Details */}
                <div className="grid grid-cols-2 gap-4 bg-ash-dark/40 border border-white/5 p-4 rounded-xs">
                  <div className="flex items-center space-x-3">
                    <Layers className="w-5 h-5 text-mustard shrink-0" />
                    <div>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Jean cũ tái sinh</p>
                      <p className="font-display font-bold text-lg text-white">x{product.originalJeansCount} quần bò cũ</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Hammer className="w-5 h-5 text-orange-earth shrink-0" />
                    <div>
                      <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">Hàm lượng thủ công</p>
                      <p className="font-display font-bold text-lg text-white">100% Khâu tay</p>
                    </div>
                  </div>
                </div>

                {/* Size Selector */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="font-display text-sm tracking-widest font-bold text-white/75">CHỌN SIZE SẴN CÓ</label>
                    <span className="text-white/40 text-[11px] font-mono">⚠️ Chỉ có duy nhất kích cỡ dưới đây</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`font-display text-base tracking-widest px-4 py-2 border cursor-pointer transition-all ${
                          selectedSize === size
                            ? 'bg-white text-denim-dark border-white font-black'
                            : 'bg-transparent border-white/10 hover:border-white/30 text-white/80'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Precise Measurements Table */}
                <div className="space-y-2">
                  <span className="font-display text-sm tracking-widest font-bold text-white/75">THÔNG SỐ ĐO (VÌ LÀ HÀNG 1-OF-1)</span>
                  <div className="bg-ash-dark/20 border border-white/5 text-xs font-mono p-3 space-y-1 text-white/70">
                    {product.measurements.chest && (
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Ngang ngực/Vòng ngực:</span>
                        <span className="text-white font-bold">{product.measurements.chest}</span>
                      </div>
                    )}
                    {product.measurements.length && (
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Chiều dài:</span>
                        <span className="text-white font-bold">{product.measurements.length}</span>
                      </div>
                    )}
                    {product.measurements.waist && (
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Vòng bụng/Vòng eo:</span>
                        <span className="text-white font-bold">{product.measurements.waist}</span>
                      </div>
                    )}
                    {product.measurements.thigh && (
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Vòng đùi:</span>
                        <span className="text-white font-bold">{product.measurements.thigh}</span>
                      </div>
                    )}
                    {product.measurements.headSize && (
                      <div className="flex justify-between border-b border-white/5 pb-1">
                        <span>Vòng đầu:</span>
                        <span className="text-white font-bold">{product.measurements.headSize}</span>
                      </div>
                    )}
                    <div className="text-[10px] text-mustard/80 pt-1">
                      * Tụi mình đo thủ công, sai số khoảng 1-2cm là bình thường nha.
                    </div>
                  </div>
                </div>

                {/* Product Story narrative section (Requested specifically!) */}
                <div className="space-y-2 bg-orange-earth/5 border-l-2 border-orange-earth p-4 rounded-r-xs">
                  <h3 className="font-display font-bold text-lg tracking-wider text-orange-earth uppercase">
                    CÂU CHUYỆN SẢN PHẨM
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-white/85 leading-relaxed font-light italic">
                    "{product.story}"
                  </p>
                </div>

              </div>

              {/* Add to Cart Actions */}
              <div className="pt-6 border-t border-white/10 mt-6 space-y-3">
                {successMessage && (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs py-2 px-3 text-center rounded-xs font-mono">
                    ✓ Đã thêm vào giỏ hàng! Tụi mình đang giữ cho bạn rồi.
                  </div>
                )}
                
                <button
                  onClick={handleAddToCart}
                  className="w-full flex items-center justify-center space-x-2 bg-mustard hover:bg-mustard/90 text-denim-dark font-display text-lg tracking-widest py-3.5 font-bold transition-all duration-300 rounded-xs cursor-pointer shadow-lg active:scale-98"
                  id="add-to-cart-modal-btn"
                >
                  <ShoppingBag className="w-5 h-5 stroke-[2]" />
                  <span>MUA NGAY (THÊM VÀO GIỎ)</span>
                </button>

                <div className="flex items-center justify-center space-x-1 text-[11px] font-mono text-white/40">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Sản phẩm 1-of-1 duy nhất. Đặt mua COD để tụi mình đóng gói gửi ngay nhé!</span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

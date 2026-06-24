import React, { useState } from 'react';
import { ShoppingBag, Eye, Heart, Layers, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { PRODUCTS } from '../data';

interface CollectionProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, size: string) => void;
  products?: Product[];
}

export default function Collection({ onSelectProduct, onAddToCart, products = PRODUCTS }: CollectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'TẤT CẢ SẢN PHẨM' },
    { id: 'outerwear', label: 'ÁO KHOÁC / GILLET' },
    { id: 'bottoms', label: 'QUẦN TRANG PHỤC' },
    { id: 'accessories', label: 'PHỤ KIỆN / NÓN' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' ₫';
  };

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    // Default size is the first size or 'Freesize'
    const defaultSize = product.sizes[0] || 'Freesize';
    onAddToCart(product, defaultSize);
  };

  return (
    <section className="py-20 bg-denim-dark text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div className="space-y-2">
            <p className="font-mono text-xs tracking-widest text-mustard uppercase font-bold">REBORN DENIM DROPS</p>
            <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight uppercase">
              CỬA HÀNG ĐỘC BẢN
            </h2>
            <div className="w-16 h-1 bg-orange-earth rotate-[-1.5deg]"></div>
          </div>
          <p className="font-sans text-white/50 text-sm max-w-md mt-4 md:mt-0 leading-relaxed">
            Mỗi thiết kế dưới đây đều được chế tác thủ công duy nhất 1 phiên bản (1-of-1). Sẽ không bao giờ có chiếc thứ 2 giống hệt chiếc của bạn. Mua là sở hữu độc quyền!
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-white/10 pb-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`font-display text-base tracking-widest px-4 py-2 border. transition-all cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-mustard text-denim-dark border-mustard font-bold'
                  : 'bg-transparent border-white/10 text-white/70 hover:border-white/40 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => onSelectProduct(product)}
              className="group cursor-pointer bg-ash-dark/40 border border-white/10 hover:border-mustard/60 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-black/60 relative"
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              id={`product-card-${product.id}`}
            >
              {/* Product Badges */}
              <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                {product.isOneOfOne && (
                  <span className="bg-orange-earth text-white font-display text-xs tracking-wider uppercase px-2.5 py-1 rotate-[-2deg] border border-white/10 font-bold">
                    Độc bản (1-of-1)
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="bg-mustard text-denim-dark font-display text-xs tracking-wider uppercase px-2.5 py-1 rotate-[1deg] border border-denim-dark font-black">
                    BÁN CHẠY
                  </span>
                )}
              </div>

              {/* Artisan Difficulty Level Badge (Right Aligned) */}
              <div className="absolute top-3 right-3 z-20 pointer-events-none">
                <span className="bg-denim-dark/80 text-white/90 border border-white/10 font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 backdrop-blur-xs">
                  ⚒️ Craft: {product.artisanDifficulty}
                </span>
              </div>

              {/* Product Image Stage */}
              <div className="relative overflow-hidden aspect-square bg-denim-light flex items-center justify-center">
                <img
                  src={hoveredProduct === product.id && product.images[1] ? product.images[1] : product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />

                {/* Hover overlay quick actions */}
                <div className="absolute inset-0 bg-denim-dark/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-3 z-10">
                  <div className="bg-white text-denim-dark p-3.5 hover:bg-mustard hover:scale-110 transition-all duration-200 shadow-lg cursor-pointer">
                    <Eye className="w-5 h-5 stroke-[2]" />
                  </div>
                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="bg-orange-earth text-white p-3.5 hover:bg-orange-earth/90 hover:scale-110 transition-all duration-200 shadow-lg cursor-pointer"
                    title="Thêm nhanh vào giỏ"
                  >
                    <ShoppingBag className="w-5 h-5 stroke-[2]" />
                  </button>
                </div>

                {/* Jeans recycled count visual sticker */}
                <div className="absolute bottom-3 left-3 bg-denim-dark/90 border border-white/15 px-2.5 py-1 font-mono text-[10px] text-white/90 uppercase tracking-widest z-10 flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-mustard" />
                  <span>X {product.originalJeansCount} quần cũ</span>
                </div>
              </div>

              {/* Product Info Block */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] text-white/40 uppercase tracking-wider">{product.category}</p>
                    <p className="font-mono text-xs text-mustard">{product.sizes.join(' | ')}</p>
                  </div>
                  <h3 className="font-display font-bold text-2xl tracking-wide group-hover:text-mustard transition-colors line-clamp-1">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="font-mono text-xl font-bold text-mustard">
                    {formatPrice(product.price)}
                  </span>
                  <span className="font-display text-sm tracking-widest text-white/50 group-hover:text-white transition-colors flex items-center space-x-1">
                    <span>XEM CHI TIẾT</span>
                    <span className="text-orange-earth">➔</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State if no products */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-xs">
            <p className="font-sans text-white/50">Hiện không có sản phẩm nào trong danh mục này.</p>
          </div>
        )}

      </div>
    </section>
  );
}

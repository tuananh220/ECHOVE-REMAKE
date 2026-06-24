import React from 'react';
import { ArrowRight, Sparkles, RefreshCw, Globe, Heart } from 'lucide-react';
import { HERO_BANNER } from '../data';

interface HeroProps {
  onExploreShop: () => void;
  onDonateJeans: () => void;
}

export default function Hero({ onExploreShop, onDonateJeans }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-denim-dark text-white py-12 md:py-24 border-b border-white/5">
      {/* Background Patchwork Grid lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      {/* Elegant Dark Decorative Circle */}
      <div className="absolute top-0 right-1/3 p-4 opacity-10 pointer-events-none hidden md:block">
        <div className="w-80 h-80 border-2 border-dashed border-white rounded-full"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Slogan and Text (Left 7 Columns on Large Screens) */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div className="inline-flex items-center space-x-2 bg-mustard/10 border border-mustard/30 text-mustard px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase self-start">
              <Sparkles className="w-3.5 h-3.5" />
              <span>UPCYCLED STREETWEAR VIETNAM</span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display font-black text-6xl sm:text-7xl lg:text-[110px] leading-[0.85] tracking-tight text-white select-none uppercase">
                JEAN CŨ,<br />
                <span className="text-denim-indigo">CHUYỆN MỚI</span>
              </h1>
              <p className="font-sans text-white/60 max-w-xl text-base sm:text-lg font-light leading-relaxed">
                Chào mừng bạn tới thế giới tuần hoàn của <strong className="text-white font-medium">ECHOVE</strong>. Tụi mình thu gom những chiếc quần jean cũ bị lãng quên, rã ráp thủ công từng mối chỉ và tái sinh chúng thành trang phục, phụ kiện độc bản mang tinh thần streetwear nổi loạn, tự do và bền vững.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={onExploreShop}
                className="group flex items-center space-x-2 bg-white hover:bg-mustard text-denim-dark font-display text-lg tracking-widest px-6 py-3.5 rounded-xs transition-all duration-300 font-bold cursor-pointer hover:-translate-y-0.5 shadow-lg shadow-black/35"
              >
                <span>XEM BST ĐỘC BẢN</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
              </button>
              
              <button
                onClick={onDonateJeans}
                className="group flex items-center space-x-2 bg-transparent hover:bg-white/5 border-2 border-white/20 hover:border-white/60 text-white font-display text-lg tracking-widest px-6 py-3 rounded-xs transition-all duration-300 cursor-pointer"
              >
                <span>GỬI CŨ LẤY MỚI</span>
                <RefreshCw className="w-4 h-4 text-mustard group-hover:rotate-180 transition-transform duration-500" />
              </button>
            </div>

            {/* Micro Stats Banner */}
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-white/10 max-w-lg">
              <div className="space-y-1">
                <p className="text-mustard font-display text-3xl font-black tracking-wider">2.8K+</p>
                <p className="text-white/60 text-xs font-mono uppercase tracking-wider">Quần Jeans Thu Gom</p>
              </div>
              <div className="space-y-1">
                <p className="text-orange-earth font-display text-3xl font-black tracking-wider">840+</p>
                <p className="text-white/60 text-xs font-mono uppercase tracking-wider">Sản Phẩm Tái Sinh</p>
              </div>
              <div className="space-y-1">
                <p className="text-emerald-500 font-display text-3xl font-black tracking-wider">3.4 TẤN</p>
                <p className="text-white/60 text-xs font-mono uppercase tracking-wider">CO2 Được Giảm Tải</p>
              </div>
            </div>

          </div>

          {/* Hero Main Graphic (Right 5 Columns on Large Screens) */}
          <div className="lg:col-span-5 relative">
            {/* Visual Frame - Raw hand-cut denim collage concept */}
            <div className="relative z-10 select-none group">
              {/* Outer decorative borders representing rough stitching */}
              <div className="absolute inset-0 border-2 border-dashed border-mustard/40 rounded-xs rotate-[-2deg] scale-[1.02] group-hover:rotate-0 transition-transform duration-500"></div>
              <div className="absolute inset-0 border border-white/10 rounded-xs rotate-[1.5deg] scale-[1.01] bg-denim-light/35"></div>
              
              {/* Main Photo */}
              <div className="relative overflow-hidden rounded-xs shadow-2xl shadow-black/80 rotate-[-1deg] border-4 border-denim-dark transition-transform duration-500 group-hover:scale-[1.01] group-hover:rotate-0 aspect-[4/5] md:aspect-square lg:aspect-[4/5] bg-denim-light">
                <img
                  src={HERO_BANNER}
                  alt="ECHOVE Upcycled Denim Streetwear"
                  className="w-full h-full object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                
                {/* Visual Accent Sticker - Handcrafted look */}
                <div className="absolute bottom-4 right-4 bg-white text-denim-dark font-display font-black text-sm uppercase tracking-widest px-3 py-1.5 rotate-[-5deg] border border-denim-dark shadow-md z-20">
                  ⚡ 1-of-1 DECONSTRUCTED
                </div>

                <div className="absolute top-4 left-4 bg-orange-earth text-white font-mono text-[10px] uppercase tracking-wider px-2 py-1 rotate-[3deg] border border-white/20 z-20">
                  HANOI URBAN CULTURE
                </div>
              </div>
            </div>

            {/* Glowing background blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-mustard/10 rounded-full blur-3xl pointer-events-none z-0"></div>
          </div>

        </div>
      </div>
    </section>
  );
}

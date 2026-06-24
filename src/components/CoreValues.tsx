import React from 'react';
import * as LucideIcons from 'lucide-react';
import { BRAND_VALUES } from '../data';

export default function CoreValues() {
  return (
    <section className="py-20 bg-denim-dark text-white border-b border-white/5 relative">
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs tracking-widest text-mustard uppercase font-bold">TRIẾT LÝ TUẦN HOÀN</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-2 text-white uppercase">
            TỤI MÌNH KHÁC BIỆT THẾ NÀO?
          </h2>
          <div className="w-24 h-1 bg-orange-earth mx-auto mt-4 rotate-[-1deg]"></div>
          <p className="font-sans text-white/60 text-base mt-4 max-w-xl mx-auto">
            Không chỉ là quần áo, ECHOVE là phong cách sống của thế hệ mới. Trân trọng quá khứ, kiến tạo tương lai và tự hào mang nhãn hiệu "Made in Vietnam".
          </p>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {BRAND_VALUES.map((val, idx) => {
            // Dynamically select Lucide Icon
            let IconComponent = LucideIcons.HelpCircle;
            if (val.icon === 'RefreshCw') IconComponent = LucideIcons.RefreshCw;
            if (val.icon === 'Layers') IconComponent = LucideIcons.Layers;
            if (val.icon === 'Hammer') IconComponent = LucideIcons.Hammer;
            if (val.icon === 'Globe') IconComponent = LucideIcons.Globe;

            return (
              <div 
                key={idx}
                className="group relative bg-ash-dark/40 border border-white/10 hover:border-mustard/60 transition-all duration-300 p-6 md:p-8 rounded-xs flex flex-col space-y-4 hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-black/45"
              >
                {/* Decorative stitch edge decoration */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/10 group-hover:border-mustard/40 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/10 group-hover:border-mustard/40 transition-colors"></div>

                <div className="bg-white/5 border border-white/15 w-12 h-12 flex items-center justify-center rounded-xs group-hover:bg-mustard group-hover:text-denim-dark transition-all duration-300 text-mustard">
                  <IconComponent className="w-6 h-6 stroke-[1.5]" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-display font-bold text-2xl tracking-wide text-white group-hover:text-mustard transition-colors">
                    {val.title}
                  </h3>
                  <p className="font-sans text-sm text-white/70 leading-relaxed font-light">
                    {val.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Circular Concept Image-text row */}
        <div className="mt-20 bg-ash-dark/30 border border-white/5 rounded-xs p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-4 flex justify-center">
            {/* Visual before-after representation */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56">
              {/* Outer rotating circle representation */}
              <div className="absolute inset-0 rounded-full border border-dashed border-mustard/30 animate-spin" style={{ animationDuration: '40s' }}></div>
              <div className="absolute inset-4 rounded-full border border-orange-earth/20"></div>
              
              <div className="absolute inset-8 rounded-full overflow-hidden border-2 border-white/10 bg-denim-dark flex flex-col items-center justify-center text-center p-4">
                <span className="font-display font-black text-xl text-orange-earth leading-none">JEANS CŨ</span>
                <span className="text-white/40 my-1 text-lg font-bold">⬇</span>
                <span className="font-display font-black text-2xl text-mustard leading-none">REBORN</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-8 space-y-4">
            <h4 className="font-display font-bold text-3xl tracking-wide text-white uppercase">VÒNG ĐỜI MỚI CỦA DENIM</h4>
            <p className="font-sans text-white/70 text-sm sm:text-base leading-relaxed font-light">
              Mỗi năm, hàng triệu tấn quần áo cũ kết thúc số phận tại bãi chôn lấp dệt may, trong đó denim là một trong những chất liệu khó phân hủy nhất. Bằng cách rã tách chất liệu và may vá thủ công tái tạo lại kết cấu, ECHOVE cam kết kéo dài vòng đời thời trang thêm từ <span className="text-mustard font-semibold">5 - 10 năm</span>. Bạn đóng góp jean cũ, tụi mình trao cho chúng tiếng nói mới trong dòng chảy văn hóa đường phố hiện đại.
            </p>
            <div className="inline-flex items-center space-x-2 text-mustard font-mono text-xs font-bold uppercase tracking-wider">
              <span>Độc bản . Có trách nhiệm . Đậm cá tính</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

import React, { useState } from 'react';
import { Hammer, Sparkles, RefreshCw, Scissors, Users, ArrowRight } from 'lucide-react';
import { REBORN_PROCESS } from '../data';
import denimJacket from '../assets/images/echove_denim_jacket_1782291760962.jpg';
import denimBag from '../assets/images/echove_denim_bag_1782291744582.jpg';
import denimHat from '../assets/images/echove_denim_hat_1782291794645.jpg';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState<'mission' | 'process' | 'before-after'>('mission');

  const beforeAfterItems = [
    {
      title: 'Áo Khoác "Deconstructed" Jacket',
      beforeImg: 'https://picsum.photos/seed/oldjeans1/500/500',
      beforeDesc: '4 chiếc quần bò Levis bạc rách gối, bẩn dầu mỡ ở gấu quần được cắt bỏ phần hư hại.',
      afterImg: denimJacket,
      afterDesc: 'Được tẩy giặt khử trùng x8 lần, rã rập ráp nối thủ công tạo ra form áo khoác lửng cá tính bùng nổ.'
    },
    {
      title: 'Túi Đeo Chéo "Patchwork" Sling Bag',
      beforeImg: 'https://picsum.photos/seed/oldjeans2/500/500',
      beforeDesc: 'Mảnh jean thừa vụn vặt và 2 phần cạp quần cũ mục khóa gỉ sét.',
      afterImg: denimBag,
      afterDesc: 'Được tái ghép nối tỉ mỉ, gia cố khóa kéo thép hầm hố, khâu tay chữ X tạo ra chiếc túi sling độc bản.'
    },
    {
      title: 'Nón Bucket "ScrapWork" Hat',
      beforeImg: 'https://picsum.photos/seed/oldjeans3/500/500',
      beforeDesc: 'Vải thừa góc đùi jeans xanh chàm Indigo rách xơ xơ xác xác.',
      afterImg: denimHat,
      afterDesc: 'May ghép dạng khâu nối mosaic, tạo vành nón tua rua tự nhiên phóng khoáng đậm chất bụi phố Hà Nội.'
    }
  ];

  return (
    <section className="py-16 bg-denim-dark text-white relative">
      <div className="absolute inset-0 opacity-[0.02] bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs tracking-widest text-mustard uppercase font-bold">ABOUT THE BRAND</p>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-2 uppercase">
            CÂU CHUYỆN CỦA ECHOVE
          </h1>
          <div className="w-20 h-1 bg-orange-earth mx-auto mt-3 rotate-[-1deg]"></div>
          <p className="font-sans text-white/70 text-sm sm:text-base mt-4 leading-relaxed font-light">
            Cái tên ECHOVE ra đời từ sự giao thoa của <strong className="text-white">Echo (Tiếng vang)</strong> và <strong className="text-white">Chove (Mưa trong tiếng Bồ Đào Nha)</strong> – hàm ý về sự gột rửa bụi bẩn, tuần hoàn hồi sinh của mẹ thiên nhiên sau cơn giông bão dệt may dồn dập.
          </p>
        </div>

        {/* Story Subtabs */}
        <div className="flex justify-center space-x-2 border-b border-white/10 pb-4 mb-12">
          {[
            { id: 'mission', label: 'Ý NIỆM SÁNG LẬP' },
            { id: 'process', label: 'QUY TRÌNH REBORN' },
            { id: 'before-after', label: 'TRƯỚC & SAU BIẾN ĐỔI' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`font-display text-sm sm:text-base tracking-widest px-4 py-2 border cursor-pointer transition-all ${
                activeTab === tab.id
                  ? 'bg-mustard text-denim-dark border-mustard font-bold'
                  : 'bg-transparent border-white/10 text-white/60 hover:text-white hover:border-white/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Founders Story & Mission */}
        {activeTab === 'mission' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center animate-in fade-in duration-300">
            {/* Visual Narrative Left */}
            <div className="lg:col-span-5 relative">
              <div className="absolute inset-0 border border-dashed border-mustard/40 rounded-xs rotate-[-3deg] scale-[1.02]"></div>
              <div className="relative overflow-hidden rounded-xs bg-ash-dark border-2 border-white/10 shadow-2xl aspect-square">
                <img
                  src="https://picsum.photos/seed/founders/600/600"
                  alt="ECHOVE Team Lab"
                  className="w-full h-full object-cover filter grayscale contrast-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-4 left-4 bg-orange-earth text-white font-mono text-[10px] uppercase tracking-widest px-2 py-1 rotate-[-2deg]">
                  ⚙️ ECHOVE LAB HANOI - 2026
                </div>
              </div>
            </div>

            {/* Mission Right */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-orange-earth font-mono text-xs font-bold uppercase tracking-widest flex items-center space-x-1.5">
                <Users className="w-4 h-4" />
                <span>CHÚNG MÌNH LÀ AI?</span>
              </span>
              <h2 className="font-display font-black text-3xl sm:text-4xl tracking-tight leading-tight text-white uppercase">
                TỤI MÌNH KHÔNG CHỈ MAY VÁ,<br />
                TỤI MÌNH THU GOM KÝ ỨC!
              </h2>
              <p className="font-sans text-white/80 leading-relaxed font-light text-sm sm:text-base">
                ECHOVE khởi nguồn vào cuối năm 2024 từ một xưởng may nhỏ tại con ngõ cổ Hà Nội bởi một nhóm bạn trẻ Gen Z đam mê nền văn hóa Urban Streetwear bụi bặm nhưng trăn trở sâu sắc với vấn nạn ô nhiễm dệt may toàn cầu. 
                <br /><br />
                Tụi mình nhận ra rằng: Mỗi chiếc quần jean cũ đã qua sử dụng luôn mang một câu chuyện độc bản. Đó có thể là vết sờn ở túi sau nơi từng đựng chiếc ví dày cộp, hay vết sờn bạc ở gối trong những chuyến đi phượt bụi tuổi trẻ đầy hoài bão. Khi những chiếc jean đó hết vai trò lịch sử của mình, thay vì vứt bỏ, tụi mình gom nhặt chúng lại, giặt sấy khử khuẩn tỉ mỉ, cắt rã ráp nối để hồi sinh chúng thành một phom dáng streetwear hiện đại hoàn toàn mới.
              </p>
              
              <div className="border-l-4 border-mustard pl-4 py-1 italic font-light font-sans text-mustard text-xs sm:text-sm">
                "Một sản phẩm của ECHOVE không được tạo ra từ tấm vải dệt máy sáo rỗng vô hồn. Nó mang tinh thần mộc mạc, thô ráp, lived-in của hàng ngàn kỷ niệm trước đó, hồi sinh rực rỡ dạo phố!"
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: The Reborn Process step-by-step */}
        {activeTab === 'process' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {REBORN_PROCESS.map((proc, idx) => (
                <div 
                  key={idx} 
                  className="bg-ash-dark/40 border border-white/10 p-6 rounded-xs space-y-4 relative"
                >
                  <div className="absolute top-4 right-4 text-orange-earth font-display font-black text-4xl opacity-30 select-none">
                    {proc.step}
                  </div>
                  
                  <div className="bg-white/5 border border-white/15 w-10 h-10 flex items-center justify-center text-mustard rounded-xs">
                    {idx === 0 && <Users className="w-5 h-5" />}
                    {idx === 1 && <RefreshCw className="w-5 h-5" />}
                    {idx === 2 && <Scissors className="w-5 h-5" />}
                    {idx === 3 && <Hammer className="w-5 h-5" />}
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-display font-bold text-xl tracking-wide text-white uppercase">{proc.title}</h3>
                    <p className="font-sans text-xs sm:text-sm text-white/60 leading-relaxed font-light">{proc.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quality Commitment Block */}
            <div className="bg-ash-dark/20 border border-white/5 p-6 sm:p-10 rounded-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-2">
                <h4 className="font-display font-bold text-2xl text-white uppercase tracking-wider">CAM KẾT CHẤT LƯỢNG VỆ SINH</h4>
                <p className="font-sans text-white/70 text-xs sm:text-sm leading-relaxed font-light">
                  Vì là chất liệu denim thu gom tái chế, an toàn sức khỏe là ưu tiên số 1 của tụi mình. Toàn bộ jean cũ khi về ECHOVE Lab đều trải qua chu trình làm sạch và diệt khuẩn khép kín 3 bước: Sát khuẩn tia cực tím UV-C ➔ Giặt tẩy sấy công nghiệp ở 90°C khử mảng bám dầu mỡ dính vải ➔ Phơi khô tự nhiên dưới nắng vàng Hà Nội. Bảo đảm vải khi may thành phẩm mềm mại, thơm mát tinh tươm như mới!
                </p>
              </div>
              <div className="md:col-span-4 flex justify-center md:justify-end">
                <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs uppercase tracking-widest px-4 py-3 text-center rounded-xs block">
                  ✓ KHỬ KHUẨN UV-C & 90°C COMPLIANT
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Before & After transformation cards */}
        {activeTab === 'before-after' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {beforeAfterItems.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-ash-dark/40 border border-white/10 rounded-xs overflow-hidden hover:border-mustard/40 transition-colors flex flex-col justify-between"
                >
                  <div className="p-4 bg-white/5 border-b border-white/10">
                    <h3 className="font-display font-bold text-xl text-white tracking-wide uppercase truncate">
                      {item.title}
                    </h3>
                  </div>

                  {/* Double Image Stage */}
                  <div className="grid grid-cols-2 bg-denim-dark">
                    {/* Before Block */}
                    <div className="relative aspect-square border-r border-white/10 group">
                      <img
                        src={item.beforeImg}
                        alt="Before upcycling"
                        className="w-full h-full object-cover filter sepia duration-500 group-hover:sepia-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/85 text-orange-earth border border-orange-earth/30 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-bold">
                        Trước / Old
                      </span>
                    </div>

                    {/* After Block */}
                    <div className="relative aspect-square">
                      <img
                        src={item.afterImg}
                        alt="After upcycling"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute bottom-2 left-2 bg-black/85 text-mustard border border-mustard/30 font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.5 font-bold animate-pulse">
                        Sau / Reborn
                      </span>
                    </div>
                  </div>

                  {/* Descs */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2 text-xs sm:text-sm">
                      <p className="font-sans text-white/50 leading-relaxed">
                        <strong className="text-orange-earth font-mono text-[10px] uppercase block tracking-wider mb-0.5">NGUYÊN LIỆU:</strong>
                        {item.beforeDesc}
                      </p>
                      <p className="font-sans text-white/80 leading-relaxed">
                        <strong className="text-mustard font-mono text-[10px] uppercase block tracking-wider mb-0.5">RÁP THÀNH PHẨM:</strong>
                        {item.afterDesc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

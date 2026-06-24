import React, { useState } from 'react';
import { Heart, MessageSquare, Instagram, MapPin, Sparkles } from 'lucide-react';
import { COMMUNITY_FEEDS } from '../data';

export default function Community() {
  const [likesState, setLikesState] = useState<{ [id: number]: number }>({
    1: 142,
    2: 208,
    3: 315
  });
  const [hasLiked, setHasLiked] = useState<{ [id: number]: boolean }>({});

  const handleLike = (id: number) => {
    if (hasLiked[id]) {
      setLikesState(prev => ({ ...prev, [id]: prev[id] - 1 }));
      setHasLiked(prev => ({ ...prev, [id]: false }));
    } else {
      setLikesState(prev => ({ ...prev, [id]: prev[id] + 1 }));
      setHasLiked(prev => ({ ...prev, [id]: true }));
    }
  };

  return (
    <section className="py-20 bg-denim-dark text-white border-b border-white/5 relative">
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="font-mono text-xs tracking-widest text-mustard uppercase font-bold">#ECHOVESTREETSTYLE</p>
          <h2 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-2 text-white uppercase">
            ECHOVE STREET CLUB
          </h2>
          <div className="w-16 h-1 bg-orange-earth mx-auto mt-4 rotate-[1deg]"></div>
          <p className="font-sans text-white/60 text-base mt-4 max-w-xl mx-auto">
            Nhìn ngắm cách tụi mình dạo phố! Những người bạn cùng chung tư duy ăn mặc có trách nhiệm, phá cách bất chấp giới hạn dệt may sáo rỗng.
          </p>
        </div>

        {/* Social Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COMMUNITY_FEEDS.map((feed) => (
            <div 
              key={feed.id}
              className="bg-ash-dark/30 border border-white/10 rounded-xs overflow-hidden group hover:border-mustard/40 transition-colors"
            >
              
              {/* Card User Header */}
              <div className="p-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-full border border-mustard overflow-hidden bg-denim-light flex items-center justify-center font-display font-black text-xs text-mustard">
                    EC
                  </div>
                  <div>
                    <h3 className="font-mono text-xs font-bold text-white group-hover:text-mustard transition-colors">
                      {feed.username}
                    </h3>
                    <p className="font-sans text-[10px] text-white/40 flex items-center">
                      <MapPin className="w-3 h-3 text-orange-earth mr-0.5" />
                      {feed.location}
                    </p>
                  </div>
                </div>
                
                <a 
                  href="https://instagram.com/echove.official" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-white/40 hover:text-mustard"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>

              {/* Photo */}
              <div className="relative overflow-hidden aspect-[4/5] bg-denim-light">
                <img
                  src={feed.image}
                  alt={feed.caption}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Card Actions & Caption */}
              <div className="p-4 space-y-3">
                <div className="flex items-center space-x-4 border-b border-white/5 pb-3">
                  <button
                    onClick={() => handleLike(feed.id)}
                    className="flex items-center space-x-1.5 hover:text-orange-earth text-xs font-mono group/btn focus:outline-none cursor-pointer"
                  >
                    <Heart 
                      className={`w-5 h-5 transition-transform group-active/btn:scale-125 ${
                        hasLiked[feed.id] ? 'fill-orange-earth text-orange-earth' : 'text-white/70'
                      }`} 
                    />
                    <span className="font-bold">{likesState[feed.id]}</span>
                  </button>
                  
                  <div className="flex items-center space-x-1.5 text-white/70 text-xs font-mono">
                    <MessageSquare className="w-5 h-5" />
                    <span>8</span>
                  </div>
                </div>

                <p className="font-sans text-xs text-white/80 leading-relaxed font-light">
                  {feed.caption}
                </p>
              </div>

            </div>
          ))}
        </div>

        {/* Join CTA */}
        <div className="mt-16 bg-gradient-to-r from-denim-dark to-ash-dark border-2 border-dashed border-white/10 p-6 sm:p-10 rounded-xs text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-mustard/20 border border-mustard/30 text-mustard px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>JOIN THE CLUB / THAM GIA PHỐ</span>
          </div>
          <h3 className="font-display font-bold text-2xl sm:text-3xl text-white uppercase tracking-wider">
            KHOE STREET STYLE ĐỘC BẢN CỦA BẠN
          </h3>
          <p className="font-sans text-xs sm:text-sm text-white/75 max-w-xl mx-auto leading-relaxed font-light">
            Tag tụi mình <strong className="text-white hover:text-mustard">@echove.official</strong> kèm hashtag <span className="text-mustard font-semibold">#echovestreetstyle</span> trên Instagram/TikTok dạo phố của bạn. Những tấm ảnh cool nhất sẽ được tụi mình chọn đăng và tặng kèm voucher mua đồ dạo phố tiếp theo nhé!
          </p>
        </div>

      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { Gift, Sparkles, MapPin, CheckCircle, Truck, PackageCheck, Info, Layers, RefreshCw } from 'lucide-react';
import { DonationSubmission, User } from '../types';
import { createDonation, getUserDonations } from '../firebase';
import { sendAutomaticEmail } from '../emailService';

interface DonorPageProps {
  user?: User | null;
}

export default function DonorPage({ user = null }: DonorPageProps) {
  const [donorName, setDonorName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [jeansCount, setJeansCount] = useState(2);
  const [condition, setCondition] = useState<'like-new' | 'worn-out' | 'distressed' | 'scrap'>('worn-out');
  const [description, setDescription] = useState('');
  const [submissions, setSubmissions] = useState<DonationSubmission[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(false);

  // Prefill details if user changes
  useEffect(() => {
    if (user) {
      if (!donorName) setDonorName(user.displayName);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  // Load from Firestore if user is logged in, else load from localStorage
  useEffect(() => {
    async function loadDonations() {
      if (user && user.email) {
        setIsLoadingList(true);
        try {
          const firestoreDonations = await getUserDonations(user.email);
          // Sync/Merge with any unsaved local donations
          const localDonationsStr = localStorage.getItem('echove_donations');
          const localDonations: DonationSubmission[] = localDonationsStr ? JSON.parse(localDonationsStr) : [];
          
          // Create a unified list with unique IDs
          const unifiedMap = new Map<string, DonationSubmission>();
          firestoreDonations.forEach(d => unifiedMap.set(d.id, d));
          localDonations.forEach(d => {
            if (!unifiedMap.has(d.id)) {
              unifiedMap.set(d.id, d);
              // Proactively save to firestore as well
              createDonation(d, user.uid);
            }
          });
          
          const sortedList = Array.from(unifiedMap.values()).sort(
            (a, b) => b.id.localeCompare(a.id)
          );
          setSubmissions(sortedList);
          localStorage.setItem('echove_donations', JSON.stringify(sortedList));
        } catch (err) {
          console.error("Error loading user donations:", err);
        } finally {
          setIsLoadingList(false);
        }
      } else {
        const localDonations = localStorage.getItem('echove_donations');
        if (localDonations) {
          setSubmissions(JSON.parse(localDonations));
        }
      }
    }
    loadDonations();
  }, [user]);

  // Update proposal text dynamically based on form changes
  useEffect(() => {
    let output = '';
    if (condition === 'like-new') {
      output = `Với ${jeansCount} chiếc jean còn rất mới, tụi mình sẽ dùng làm phom dáng chủ đạo cho chiếc Áo Khoác Deconstructed hoặc Áo Gilet tactical chất chơi.`;
    } else if (condition === 'worn-out') {
      output = `Vết phai tự nhiên từ ${jeansCount} quần bò cũ của bạn cực kỳ thích hợp làm mảng ghép sắc độ trung tính trên các BST Quần Cargo rách gối bụi bặm.`;
    } else if (condition === 'distressed') {
      output = `Đầu gối sờn rách từ quần jean của bạn sẽ được tụi mình giữ nguyên vẹn để ráp thành túi bao tử đùi cá tính hoặc làm chi tiết sờn độc đáo trên vai áo khoác.`;
    } else {
      output = `Những dải vải vụn xơ từ denim cũ sẽ được tụi mình đập nhỏ, ráp ghép theo kết cấu Mosaic khâu nổi chữ X để tái tạo thành Nón Bucket hoặc Phụ kiện bọc ví dạo phố cực nghệ.`;
    }
    setProposalText(output);
  }, [condition, jeansCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!donorName || !phone || !email || !address) {
      alert('Vui lòng điền đầy đủ thông tin liên hệ nha bạn!');
      return;
    }

    const newDonation: DonationSubmission = {
      id: 'DON-' + Math.floor(Math.random() * 100000),
      donorName,
      phone,
      email,
      address,
      jeansCount,
      condition,
      description: description || 'Gửi gắm jean cũ hồi sinh câu chuyện mới cùng ECHOVE.',
      status: 'pending',
      suggestedOutput: proposalText,
      createdAt: new Date().toLocaleDateString('vi-VN')
    };

    const updated = [newDonation, ...submissions];
    setSubmissions(updated);
    localStorage.setItem('echove_donations', JSON.stringify(updated));

    // Save to Firestore
    try {
      await createDonation(newDonation, user?.uid || undefined);
    } catch (err) {
      console.error("Error saving donation to cloud:", err);
    }

    // Trigger Automatic Email
    try {
      await sendAutomaticEmail('donation_received', newDonation.email, newDonation.donorName, newDonation);
    } catch (err) {
      console.error("Error sending donation confirmation email:", err);
    }

    // Reset Form
    setDonorName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setDescription('');
    setJeansCount(2);
    setCondition('worn-out');
    setIsSuccess(true);

    // Scroll to success block
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  const getConditionLabel = (cond: string) => {
    switch (cond) {
      case 'like-new': return 'Còn khá mới, phom đẹp';
      case 'worn-out': return 'Phai màu, sờn nhẹ';
      case 'distressed': return 'Rách gối, sờn rách nhiều';
      case 'scrap': return 'Hư hỏng nặng, dải vải vụn';
      default: return cond;
    }
  };

  return (
    <section className="py-16 bg-denim-dark text-white relative">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:30px_30px]"></div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="bg-orange-earth/20 text-orange-earth border border-orange-earth/30 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase tracking-widest">
            BE A DONOR / CÙNG NHAU KIẾN TẠO
          </span>
          <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mt-3 uppercase">
            THU GOM DENIM CŨ
          </h1>
          <div className="w-20 h-1 bg-mustard mx-auto mt-3 rotate-[-1deg]"></div>
          <p className="font-sans text-white/70 text-sm sm:text-base mt-4 leading-relaxed font-light">
            Trong tủ bạn có chiếc jean cũ sờn rách, bỏ đi thì tiếc mà mặc thì không còn vừa? <strong className="text-white">Gửi tặng tụi mình nhé!</strong> ECHOVE sẽ hỗ trợ thu nhận tại nhà, gửi tặng bạn Voucher giảm giá <span className="text-mustard font-semibold">15%</span> cho BST mới và chịu trách nhiệm hồi sinh em nó thành một tác phẩm nghệ thuật đường phố cực chất.
          </p>
        </div>

        {/* Success Banner */}
        {isSuccess && (
          <div className="bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-300 p-6 rounded-xs mb-10 space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <h3 className="font-display font-bold text-2xl tracking-wide uppercase">ĐĂNG KÝ QUYÊN GÓP THÀNH CÔNG!</h3>
                <p className="font-sans text-sm text-emerald-300/80">
                  Cảm ơn bạn rất nhiều! Tụi mình đã lưu thông tin quyên góp. ECHOVE sẽ chủ động gọi điện xác nhận trong vòng 24h và điều phối đơn vị vận chuyển ghé lấy quần tận nhà bạn nhé (Toàn bộ phí ship gửi quần tụi mình lo hết!).
                </p>
              </div>
            </div>
            <div className="pt-2 text-xs font-mono flex items-center space-x-2 text-white/50">
              <span>🎁 Voucher giảm giá 15% đã được gửi tạm vào hộp thư email đăng ký của bạn.</span>
            </div>
            <button 
              onClick={() => setIsSuccess(false)}
              className="text-white text-xs font-mono underline hover:text-mustard block pt-1 cursor-pointer"
            >
              [Đóng thông báo]
            </button>
          </div>
        )}

        {/* Grid layout: Form & Process info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Block: The Interactive Form (7 Columns) */}
          <div className="lg:col-span-7 bg-ash-dark/40 border border-white/10 p-6 sm:p-8 rounded-xs space-y-6">
            <div className="border-b border-white/10 pb-4">
              <h2 className="font-display font-bold text-2xl tracking-wide uppercase flex items-center space-x-2">
                <Gift className="w-6 h-6 text-orange-earth" />
                <span>FORM QUYÊN GÓP JEAN CŨ</span>
              </h2>
              <p className="font-mono text-[11px] text-white/40 uppercase tracking-widest mt-1">Đổi denim cũ, nhận voucher mới 15%</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Contact Info Row 1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/80 uppercase font-semibold">Tên của bạn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nguyễn Văn A"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/80 uppercase font-semibold">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    placeholder="0912xxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                  />
                </div>
              </div>

              {/* Contact Info Row 2 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/80 uppercase font-semibold">Email liên hệ *</label>
                  <input
                    type="email"
                    required
                    placeholder="ban@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-denim-dark border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-display text-sm tracking-widest text-white/80 uppercase font-semibold">Số lượng quần gửi tặng *</label>
                  <div className="flex items-center space-x-3 bg-denim-dark border border-white/10 px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => setJeansCount(Math.max(1, jeansCount - 1))}
                      className="p-1 text-white/60 hover:text-white font-black text-lg focus:outline-none cursor-pointer"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-bold text-mustard">{jeansCount} chiếc</span>
                    <button
                      type="button"
                      onClick={() => setJeansCount(jeansCount + 1)}
                      className="p-1 text-white/60 hover:text-white font-black text-lg focus:outline-none cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="font-display text-sm tracking-widest text-white/80 uppercase font-semibold">Địa chỉ lấy quần tận nơi *</label>
                <input
                  type="text"
                  required
                  placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành phố"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-denim-dark border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mustard font-sans"
                />
              </div>

              {/* Condition selection */}
              <div className="space-y-1.5">
                <label className="font-display text-sm tracking-widest text-white/80 uppercase font-semibold">Tình trạng chất vải jeans cũ</label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    { id: 'like-new', label: 'Còn khá mới', desc: 'Sợi dai, không rách rưới' },
                    { id: 'worn-out', label: 'Sờn phai màu', desc: 'Có phai màu gối tự nhiên' },
                    { id: 'distressed', label: 'Rách rưới nhiều', desc: 'Có vết thủng gối, tua rua' },
                    { id: 'scrap', label: 'Nát bét/vải vụn', desc: 'Mảnh jean thừa cắt dở' }
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setCondition(cond.id as any)}
                      className={`p-3 border text-left flex flex-col space-y-1 cursor-pointer transition-all rounded-xs ${
                        condition === cond.id
                          ? 'border-mustard bg-mustard/10 text-white'
                          : 'border-white/10 bg-transparent hover:border-white/30 text-white/60'
                      }`}
                    >
                      <span className="font-display font-bold tracking-wide text-sm">{cond.label}</span>
                      <span className="font-sans text-[10px] opacity-80">{cond.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Story / Description */}
              <div className="space-y-1.5">
                <label className="font-display text-sm tracking-widest text-white/80 uppercase font-semibold">Vài lời nhắn gửi hoặc kỷ niệm của quần cũ (nếu có)</label>
                <textarea
                  placeholder="Ví dụ: Đây là chiếc jean Levis dạo phố thời sinh viên của mình, mong ECHOVE tái sinh em nó thành một chiếc túi xách đeo dạo phố thật cool ngầu nha..."
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-denim-dark border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-mustard font-sans resize-none"
                />
              </div>

              {/* Dynamic Reborn Slogan Proposal Box */}
              <div className="bg-orange-earth/10 border-l-2 border-orange-earth p-4 rounded-r-xs space-y-1.5">
                <span className="font-display text-xs tracking-wider text-orange-earth font-bold uppercase block">🌱 ECHOVE REBORN PROPOSAL</span>
                <p className="font-sans text-xs sm:text-sm text-white/90 leading-relaxed italic">
                  "{proposalText}"
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-earth hover:bg-orange-earth/90 text-white font-display text-lg tracking-widest py-3.5 font-bold rounded-xs transition-all duration-300 shadow-md cursor-pointer uppercase"
              >
                GỬI YÊU CẦU THU GOM TẬN NHÀ (MIỄN PHÍ SHIP)
              </button>

            </form>
          </div>

          {/* Right Block: Process information & Donor history (5 Columns) */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* The Process */}
            <div className="bg-ash-dark/30 border border-white/5 p-6 rounded-xs space-y-5">
              <h3 className="font-display font-bold text-xl tracking-wide uppercase text-mustard border-b border-white/5 pb-2">
                HÀNH TRÌNH TÁI SINH HOẠT ĐỘNG THẾ NÀO?
              </h3>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Bạn Đăng Ký', desc: 'Điền form thông tin bên cạnh. Tụi mình sẽ chuẩn bị mã vận chuyển miễn phí.' },
                  { step: '02', title: 'Tụi Mình Ghé Lấy', desc: 'Shipper ghé thu nhận tận cửa nhà bạn, mang jeans về ECHOVE Lab Hà Nội.' },
                  { step: '03', title: 'Gửi Tặng Quà', desc: 'ECHOVE kích hoạt mã giảm giá 15% gửi email cám ơn tấm lòng của bạn.' },
                  { step: '04', title: 'Lên Đồ Reborn', desc: 'Jeans được xử lý tiệt trùng, cắt rã rập khâu tay tỉ mỉ tái sinh thành 1-of-1 streetwear!' }
                ].map((proc) => (
                  <div key={proc.step} className="flex space-x-3 items-start text-xs sm:text-sm">
                    <span className="font-display font-black text-lg text-orange-earth bg-orange-earth/10 px-2 py-0.5 rounded-xs shrink-0">{proc.step}</span>
                    <div className="space-y-0.5">
                      <p className="font-display font-bold text-white text-base tracking-wide">{proc.title}</p>
                      <p className="font-sans text-white/60 leading-relaxed font-light">{proc.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Donor History Card (LocalStorage based) */}
            <div className="bg-ash-dark/30 border border-white/5 p-6 rounded-xs space-y-4">
              <h3 className="font-display font-bold text-xl tracking-wide uppercase text-white border-b border-white/5 pb-2">
                LỊCH SỬ ĐÓNG GÓP CỦA BẠN
              </h3>
              {submissions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="font-sans text-xs text-white/40 italic">Chưa có đóng góp nào được ghi nhận locally.</p>
                  <p className="font-sans text-[11px] text-mustard mt-1">Hãy gửi những chiếc jean cũ đầu tiên nhé! 🙌</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="bg-denim-dark/60 border border-white/5 p-3 rounded-xs text-xs space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono font-bold text-mustard">{sub.id}</span>
                        <span className="text-[10px] text-white/40">{sub.createdAt}</span>
                      </div>
                      <div className="flex justify-between items-center text-white/70">
                        <span>Số lượng: {sub.jeansCount} quần jeans</span>
                        <span className="bg-white/5 px-2 py-0.5 border border-white/10 text-[10px]">
                          {getConditionLabel(sub.condition)}
                        </span>
                      </div>
                      
                      {/* Live status timeline tracking */}
                      <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-white/5 text-[10px] text-center">
                        <div className="flex flex-col items-center">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mb-0.5" />
                          <span className="text-emerald-500 font-mono font-bold">Đã ký</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <Truck className={`w-3.5 h-3.5 mb-0.5 ${sub.status !== 'pending' ? 'text-emerald-500' : 'text-white/20'}`} />
                          <span className={`${sub.status !== 'pending' ? 'text-emerald-500 font-bold' : 'text-white/20'} font-mono`}>Lấy hàng</span>
                        </div>
                        <div className="flex flex-col items-center">
                          <PackageCheck className={`w-3.5 h-3.5 mb-0.5 ${sub.status === 'received' ? 'text-emerald-500' : 'text-white/20'}`} />
                          <span className={`${sub.status === 'received' ? 'text-emerald-500 font-bold' : 'text-white/20'} font-mono`}>Lab nhận</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

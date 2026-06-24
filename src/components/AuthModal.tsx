import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User as UserIcon, Shield, Chrome, Facebook, Instagram, ArrowRight, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  // Status States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // In-app social consent pop-up state
  const [socialProvider, setSocialProvider] = useState<'google' | 'facebook' | 'instagram' | null>(null);
  const [socialStep, setSocialStep] = useState<'loading' | 'consent' | 'success'>('loading');
  const [selectedPresetUser, setSelectedPresetUser] = useState<number>(0);

  const socialPresets = [
    {
      name: 'Minh Streetwear',
      email: 'minh.streetwear@gmail.com',
      avatar: 'MS',
      avatarBg: 'bg-emerald-500/25 text-emerald-400',
      points: 150,
    },
    {
      name: 'Vy Denim',
      email: 'vy.upcycled@gmail.com',
      avatar: 'VD',
      avatarBg: 'bg-mustard/25 text-mustard',
      points: 240,
    },
    {
      name: 'Hải Vintage',
      email: 'hai.vintage@gmail.com',
      avatar: 'HV',
      avatarBg: 'bg-denim-indigo/50 text-white',
      points: 420,
    }
  ];

  const handleClose = () => {
    // Reset states
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError('');
    setSocialProvider(null);
    onClose();
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    if (activeTab === 'register') {
      if (!displayName) {
        setError('Vui lòng điền tên hiển thị.');
        return;
      }
      if (!agreeTerms) {
        setError('Bạn cần đồng ý với điều khoản sử dụng.');
        return;
      }
    }

    setIsLoading(true);

    // Simulate authentic authentication response
    setTimeout(() => {
      setIsLoading(false);
      const isAdmin = email.trim().toLowerCase() === 'admin@echove.vn';
      const matchedUser: User = {
        uid: isAdmin ? 'admin-uid' : Math.random().toString(36).substr(2, 9),
        email,
        displayName: isAdmin ? 'ECHOVE Admin' : (activeTab === 'register' ? displayName : email.split('@')[0]),
        providerId: 'password',
        points: isAdmin ? 9999 : (activeTab === 'register' ? 50 : 120), // bonus for registering!
        role: isAdmin ? 'admin' : 'user',
      };
      
      onLoginSuccess(matchedUser);
      handleClose();
    }, 1500);
  };

  const handleSocialClick = (provider: 'google' | 'facebook' | 'instagram') => {
    setSocialProvider(provider);
    setSocialStep('loading');
    
    // Simulate initial handshakes
    setTimeout(() => {
      setSocialStep('consent');
    }, 1000);
  };

  const handleSocialConsent = () => {
    setSocialStep('loading');
    
    setTimeout(() => {
      setSocialStep('success');
      setTimeout(() => {
        const preset = socialPresets[selectedPresetUser];
        const matchedUser: User = {
          uid: `${socialProvider}-${Math.random().toString(36).substr(2, 9)}`,
          email: preset.email,
          displayName: preset.name,
          providerId: socialProvider!,
          points: preset.points,
        };
        onLoginSuccess(matchedUser);
        handleClose();
      }, 1000);
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1012]/80 backdrop-blur-md">
          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#1C1E22] border border-white/10 p-6 sm:p-8 rounded-xs overflow-hidden shadow-2xl"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <div className="w-24 h-24 border border-dashed border-white rounded-full"></div>
            </div>

            {/* Standard Login / Signup Interface */}
            <AnimatePresence mode="wait">
              {!socialProvider ? (
                <motion.div
                  key="auth-main"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  {/* Close button */}
                  <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors cursor-pointer p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  {/* Header */}
                  <div className="text-center space-y-1">
                    <div className="inline-flex items-center space-x-1 bg-mustard/15 text-mustard px-2 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase">
                      <span>STREET STYLE CLUB</span>
                    </div>
                    <h2 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                      {activeTab === 'login' ? 'ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN'}
                    </h2>
                    <p className="text-white/40 text-xs font-light">
                      {activeTab === 'login' 
                        ? 'Chào mừng bạn quay trở lại với xưởng tái chế ECHOVE!' 
                        : 'Tham gia Street Club để tích luỹ điểm xanh upcycle và nhận quà độc bản.'
                      }
                    </p>
                  </div>

                  {/* Tab Selectors */}
                  <div className="grid grid-cols-2 border-b border-white/10 pb-1">
                    <button
                      onClick={() => { setActiveTab('login'); setError(''); }}
                      className={`pb-2.5 font-display text-sm tracking-widest uppercase border-b-2 transition-all ${
                        activeTab === 'login'
                          ? 'border-mustard text-mustard font-bold'
                          : 'border-transparent text-white/40 hover:text-white/70'
                      }`}
                    >
                      ĐĂNG NHẬP
                    </button>
                    <button
                      onClick={() => { setActiveTab('register'); setError(''); }}
                      className={`pb-2.5 font-display text-sm tracking-widest uppercase border-b-2 transition-all ${
                        activeTab === 'register'
                          ? 'border-mustard text-mustard font-bold'
                          : 'border-transparent text-white/40 hover:text-white/70'
                      }`}
                    >
                      ĐĂNG KÝ MỚI
                    </button>
                  </div>

                  {/* Errors */}
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xs flex items-start space-x-2 text-xs">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleEmailAuth} className="space-y-4">
                    {activeTab === 'register' && (
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Tên hiển thị / Nickname</label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                          <input
                            type="text"
                            required
                            placeholder="vd: Minh Streetwear"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            className="w-full bg-[#0F1012] border border-white/10 text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mustard transition-colors rounded-xs"
                          />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Địa chỉ Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="email"
                          required
                          placeholder="ten@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full bg-[#0F1012] border border-white/10 text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mustard transition-colors rounded-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Mật khẩu bảo mật</label>
                        {activeTab === 'login' && (
                          <button type="button" onClick={() => setError('Tính năng khôi phục mật khẩu đang được tích hợp.')} className="text-[10px] text-mustard hover:underline font-mono">
                            QUÊN MẬT KHẨU?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <input
                          type="password"
                          required
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full bg-[#0F1012] border border-white/10 text-white pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-mustard transition-colors rounded-xs"
                        />
                      </div>
                    </div>

                    {activeTab === 'register' && (
                      <label className="flex items-start space-x-2 pt-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={agreeTerms}
                          onChange={(e) => setAgreeTerms(e.target.checked)}
                          className="mt-0.5 rounded-sm border-white/15 bg-black text-mustard focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="text-[11px] text-white/60 leading-relaxed font-light">
                          Tôi đồng ý với chính sách thu gom, chia sẻ dữ liệu cộng đồng và điều khoản thành viên của ECHOVE Studio.
                        </span>
                      </label>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-mustard hover:bg-mustard/90 text-denim-dark font-display font-black text-lg tracking-widest py-3 flex items-center justify-center space-x-2 transition-all cursor-pointer rounded-xs"
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="w-5 h-5 animate-spin" />
                          <span>ĐANG XỬ LÝ...</span>
                        </>
                      ) : (
                        <>
                          <span>{activeTab === 'login' ? 'TIẾP TỤC DẠO PHỐ' : 'GIA NHẬP STREET CLUB'}</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    {/* Admin Quick Login Shortcut */}
                    {activeTab === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@echove.vn');
                          setPassword('admin123');
                          setIsLoading(true);
                          setTimeout(() => {
                            setIsLoading(false);
                            const adminUser: User = {
                              uid: 'admin-uid',
                              email: 'admin@echove.vn',
                              displayName: 'ECHOVE Admin',
                              providerId: 'password',
                              points: 9999,
                              role: 'admin'
                            };
                            onLoginSuccess(adminUser);
                            onClose();
                          }, 800);
                        }}
                        className="w-full py-2 px-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-mono text-[11px] tracking-wider uppercase border border-red-500/30 rounded-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Đăng nhập nhanh Admin (Trải Nghiệm)</span>
                      </button>
                    )}
                  </form>

                  {/* Social Divisor */}
                  <div className="relative flex py-2 items-center text-xs font-mono text-white/20">
                    <div className="flex-grow border-t border-white/5"></div>
                    <span className="flex-shrink mx-4 uppercase tracking-widest text-[9px]">HOẶC KẾT NỐI MXH</span>
                    <div className="flex-grow border-t border-white/5"></div>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    {/* Google */}
                    <button
                      onClick={() => handleSocialClick('google')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors rounded-xs group"
                    >
                      <Chrome className="w-5 h-5 text-red-400 group-hover:scale-105 transition-transform" />
                      <span className="text-[9px] font-mono text-white/60 font-bold">GOOGLE</span>
                    </button>

                    {/* Facebook */}
                    <button
                      onClick={() => handleSocialClick('facebook')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors rounded-xs group"
                    >
                      <Facebook className="w-5 h-5 text-blue-400 group-hover:scale-105 transition-transform" />
                      <span className="text-[9px] font-mono text-white/60 font-bold">FACEBOOK</span>
                    </button>

                    {/* Instagram */}
                    <button
                      onClick={() => handleSocialClick('instagram')}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 p-3 flex flex-col items-center justify-center space-y-1 cursor-pointer transition-colors rounded-xs group"
                    >
                      <Instagram className="w-5 h-5 text-pink-400 group-hover:scale-105 transition-transform" />
                      <span className="text-[9px] font-mono text-white/60 font-bold">INSTAGRAM</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Interactive In-App Social OAuth Dialog */
                <motion.div
                  key="social-oauth"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  {/* OAuth Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                      <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black">
                        MẠNG KẾT NỐI AN TOÀN
                      </span>
                    </div>
                    <span className="text-white/40 text-[10px] font-mono">ECHOVE SECURE AUTH v2.6</span>
                  </div>

                  {socialStep === 'loading' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <RefreshCw className="w-10 h-10 text-mustard animate-spin" />
                      <p className="font-mono text-xs text-white/60 tracking-wider">
                        ĐANG KẾT NỐI TỚI {socialProvider.toUpperCase()} SERVERS...
                      </p>
                    </div>
                  )}

                  {socialStep === 'consent' && (
                    <div className="space-y-5">
                      <div className="flex items-center space-x-3 bg-white/5 p-4 border border-white/10 rounded-xs">
                        {socialProvider === 'google' && <Chrome className="w-10 h-10 text-red-400" />}
                        {socialProvider === 'facebook' && <Facebook className="w-10 h-10 text-blue-400" />}
                        {socialProvider === 'instagram' && <Instagram className="w-10 h-10 text-pink-400" />}
                        
                        <div>
                          <h4 className="font-display font-bold text-lg text-white">XÁC THỰC THÀNH VIÊN</h4>
                          <p className="text-white/50 text-xs">Ủy quyền cung cấp thông tin cho ECHOVE Studio</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="block text-[10px] font-mono uppercase text-white/50 tracking-wider">Chọn tài khoản thành viên liên kết:</label>
                        
                        <div className="space-y-2">
                          {socialPresets.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setSelectedPresetUser(idx)}
                              className={`w-full text-left p-3 flex items-center justify-between border rounded-xs transition-all cursor-pointer ${
                                selectedPresetUser === idx
                                  ? 'bg-white/10 border-mustard shadow-md'
                                  : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-8 h-8 rounded-full ${preset.avatarBg} font-display font-black text-xs flex items-center justify-center`}>
                                  {preset.avatar}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-white">{preset.name}</p>
                                  <p className="text-[10px] font-mono text-white/40">{preset.email}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="block text-must font-mono font-bold text-xs text-mustard">+{preset.points} Pts</span>
                                <span className="block text-[8px] font-mono text-white/30">Street Club</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="bg-[#0F1012] p-3 text-[10px] font-mono text-white/40 leading-relaxed border border-white/5">
                        🛡️ Bằng việc chọn tài khoản, bạn cho phép ứng dụng này truy xuất thông tin Hồ sơ công khai và Email dạo phố. ECHOVE cam kết không tiết lộ dữ liệu cá nhân của bạn.
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setSocialProvider(null)}
                          className="border border-white/10 hover:border-white/30 text-white font-display text-sm tracking-widest py-2.5 transition-colors cursor-pointer rounded-xs text-center"
                        >
                          HỦY BỎ
                        </button>
                        <button
                          type="button"
                          onClick={handleSocialConsent}
                          className="bg-mustard hover:bg-mustard/90 text-denim-dark font-display font-black text-sm tracking-widest py-2.5 transition-all cursor-pointer rounded-xs text-center"
                        >
                          CHẤP NHẬN ➔
                        </button>
                      </div>
                    </div>
                  )}

                  {socialStep === 'success' && (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <motion.div
                        initial={{ scale: 0.8, rotate: -20 }}
                        animate={{ scale: 1.1, rotate: 0 }}
                        className="text-emerald-400"
                      >
                        <CheckCircle className="w-16 h-16" />
                      </motion.div>
                      <h4 className="font-display font-black text-2xl text-white tracking-wide uppercase text-center">
                        LIÊN KẾT THÀNH CÔNG!
                      </h4>
                      <p className="font-mono text-[10px] text-white/50 text-center tracking-wider uppercase">
                        CHÀO MỪNG BẠN GIA NHẬP ECHOVE CLUB...
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React, { useState } from 'react';
import { ShoppingBag, Menu, X, Gift, RefreshCw, LogIn, LogOut, User as UserIcon, Award, Sun, Moon } from 'lucide-react';
import { User } from '../types';
import logo from '../assets/logo.svg';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  cartCount: number;
  setIsCartOpen: (open: boolean) => void;
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export default function Navbar({
  currentTab,
  setCurrentTab,
  cartCount,
  setIsCartOpen,
  user,
  onOpenAuth,
  onSignOut,
  theme,
  onToggleTheme,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const baseNavItems = [
    { id: 'home', label: 'TRANG CHỦ' },
    { id: 'shop', label: 'CỬA HÀNG' },
    { id: 'donor', label: 'THU GOM DENIM' },
    { id: 'about', label: 'CÂU CHUYỆN' },
  ];

  const navItems = user && user.role === 'admin' 
    ? [...baseNavItems, { id: 'admin', label: '⚙️ QUẢN TRỊ' }]
    : baseNavItems;

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getUserInitials = (name: string) => {
    if (!name) return 'EC';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-50 bg-denim-dark/95 border-b border-white/10 backdrop-blur-md text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo / Brand Name */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center group focus:outline-none cursor-pointer"
            >
              <div className="bg-white px-3 py-1.5 rounded-xs shadow-md transition-all duration-300 group-hover:scale-105 flex items-center justify-center">
                <img src={logo} alt="ECHOVE Logo" className="h-6 w-auto object-contain" />
              </div>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`font-display text-lg tracking-widest hover:text-mustard transition-colors duration-200 cursor-pointer relative py-1 ${
                  currentTab === item.id
                    ? 'text-mustard after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-mustard'
                    : 'text-white/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Cart, User Account & Mobile menu button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Donation Shortcut */}
            <button
              onClick={() => handleNavClick('donor')}
              className="hidden lg:flex items-center space-x-1 bg-orange-earth hover:bg-orange-earth/90 text-white font-display text-sm tracking-widest px-3 py-1.5 border border-white/20 hover:border-white/40 transition-all rounded-xs cursor-pointer"
            >
              <Gift className="w-4 h-4 animate-pulse" />
              <span>GỬI JEAN CŨ</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={onToggleTheme}
              className="p-2 text-white/90 hover:text-mustard hover:scale-105 transition-all duration-200 focus:outline-none cursor-pointer"
              title={theme === 'dark' ? 'Chuyển sang Giao diện Sáng' : 'Chuyển sang Giao diện Tối'}
            >
              {theme === 'dark' ? <Sun className="w-5.5 h-5.5 stroke-[1.5]" /> : <Moon className="w-5.5 h-5.5 stroke-[1.5]" />}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-white/90 hover:text-mustard hover:scale-105 transition-all duration-200 focus:outline-none cursor-pointer"
              id="navbar-cart-btn"
            >
              <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-mustard text-denim-dark text-xs font-black rounded-full h-5 w-5 flex items-center justify-center border-2 border-denim-dark font-mono animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* User Profile dropdown or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center space-x-2 p-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-mustard/50 transition-all rounded-xs cursor-pointer focus:outline-none"
                >
                  <div className="w-7 h-7 rounded-xs bg-mustard/20 text-mustard border border-mustard/30 flex items-center justify-center font-display font-black text-xs">
                    {getUserInitials(user.displayName)}
                  </div>
                  <span className="hidden sm:inline text-xs font-mono font-bold tracking-tight text-white/90 max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                </button>

                {/* User Dropdown */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-denim-light border border-white/10 shadow-2xl p-4 space-y-4 rounded-xs z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="border-b border-white/5 pb-3">
                      <p className="text-white font-semibold text-sm truncate">{user.displayName}</p>
                      <p className="text-white/40 text-[10px] font-mono truncate">{user.email}</p>
                      <div className="mt-1 inline-flex items-center space-x-1 bg-denim-indigo/30 border border-denim-indigo/40 px-2 py-0.5 rounded-sm text-[9px] font-mono text-white/70">
                        <span className="uppercase">{user.providerId}</span>
                        <span>ACCOUNT</span>
                      </div>
                    </div>

                    <div className="bg-denim-dark p-3 border border-white/5 flex items-center justify-between rounded-xs">
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-mustard" />
                        <div>
                          <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Điểm thành viên</p>
                          <p className="text-sm font-black text-white font-mono leading-none">{user.points || 0} PTS</p>
                        </div>
                      </div>
                      <span className="bg-mustard/10 border border-mustard/20 text-mustard text-[8px] font-mono uppercase px-1.5 py-0.5 font-bold rounded-sm">
                        STREET CLUB
                      </span>
                    </div>

                    <div className="space-y-1">
                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setIsUserDropdownOpen(false);
                            handleNavClick('admin');
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-mustard font-bold hover:bg-mustard/10 transition-colors rounded-xs flex items-center space-x-2 cursor-pointer"
                        >
                          <span>⚙️ TRANG QUẢN TRỊ ADMIN</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          handleNavClick('donor');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors rounded-xs flex items-center space-x-2 cursor-pointer"
                      >
                        <Gift className="w-4 h-4 text-orange-earth" />
                        <span>Xem trạng thái thu gom</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsUserDropdownOpen(false);
                          onSignOut();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors rounded-xs flex items-center space-x-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất tài khoản</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 border border-white/10 hover:border-mustard bg-white/5 hover:bg-white/10 font-display text-xs sm:text-sm tracking-widest px-3 py-1.5 transition-all rounded-xs cursor-pointer text-white"
              >
                <LogIn className="w-3.5 h-3.5 text-mustard" />
                <span className="font-bold">ĐĂNG NHẬP</span>
              </button>
            )}

            {/* Hamburger menu */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white hover:text-mustard focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 stroke-[1.5]" />
              ) : (
                <Menu className="w-6 h-6 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-denim-dark border-b border-white/10 animate-in fade-in slide-in-from-top duration-200">
          <div className="px-2 pt-3 pb-6 space-y-2 sm:px-3 text-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full py-3 font-display text-xl tracking-widest hover:text-mustard ${
                  currentTab === item.id ? 'text-mustard font-bold bg-white/5' : 'text-white/70'
                }`}
              >
                {item.label}
              </button>
            ))}

            {user && (
              <div className="mx-4 p-3 border-t border-b border-white/5 bg-denim-light flex items-center justify-between rounded-xs my-3 text-left">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xs bg-mustard/25 text-mustard flex items-center justify-center font-display font-black text-xs border border-mustard/30">
                    {getUserInitials(user.displayName)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white truncate max-w-[120px]">{user.displayName}</p>
                    <p className="text-[10px] font-mono text-white/40 truncate max-w-[120px]">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-mono text-white/40 uppercase">Số dư điểm</p>
                  <p className="text-xs font-mono font-bold text-mustard">{user.points || 0} PTS</p>
                </div>
              </div>
            )}

            <div className="pt-2 px-4 space-y-2">
              {/* Mobile Theme Toggle */}
              <button
                onClick={() => {
                  onToggleTheme();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-white/5 border border-white/10 text-white font-display text-lg tracking-widest py-3 rounded-xs"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5 text-mustard" /> : <Moon className="w-5 h-5 text-mustard" />}
                <span>{theme === 'dark' ? 'CHUYỂN NỀN SÁNG' : 'CHUYỂN NỀN TỐI'}</span>
              </button>

              <button
                onClick={() => handleNavClick('donor')}
                className="w-full flex items-center justify-center space-x-2 bg-orange-earth text-white font-display text-lg tracking-widest py-3 border border-white/20 rounded-xs"
              >
                <Gift className="w-5 h-5" />
                <span>GỬI TẶNG JEAN CŨ</span>
              </button>

              {user ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSignOut();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-red-500/10 border border-red-500/20 text-red-400 font-display text-lg tracking-widest py-3 rounded-xs"
                >
                  <LogOut className="w-5 h-5" />
                  <span>ĐĂNG XUẤT</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAuth();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-mustard/15 border border-mustard/20 text-mustard font-display text-lg tracking-widest py-3 rounded-xs"
                >
                  <LogIn className="w-5 h-5" />
                  <span>ĐĂNG NHẬP THÀNH VIÊN</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}


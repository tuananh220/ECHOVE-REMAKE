import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CoreValues from './components/CoreValues';
import Collection from './components/Collection';
import ProductDetailModal from './components/ProductDetailModal';
import DonorPage from './components/DonorPage';
import Cart from './components/Cart';
import AboutPage from './components/AboutPage';
import Community from './components/Community';
import AdminDashboard from './components/AdminDashboard';
import TrackingModal from './components/TrackingModal';

import { Product, CartItem, User } from './types';
import AuthModal from './components/AuthModal';
import { getAllProducts } from './firebase';
import { Sparkles, MapPin, Instagram, Mail, Phone, ChevronRight, Facebook } from 'lucide-react';
import logo from './assets/logo.svg';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(false);
  
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('echove_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  // Toggle theme handler
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync theme with DOM element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
    } else {
      root.classList.remove('light');
    }
    localStorage.setItem('echove_theme', theme);
  }, [theme]);
  
  // Custom Dynamic Products list state
  const [products, setProducts] = useState<Product[]>([]);
  
  // User Authentication States
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState<boolean>(false);

  // Load cart, user, and products from localStorage/Firestore on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('echove_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    
    const savedUser = localStorage.getItem('echove_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const savedProducts = localStorage.getItem('echove_products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }

    // Always fetch latest products from Firestore to keep data up to date
    getAllProducts().then((firestoreProducts) => {
      if (firestoreProducts) {
        setProducts(firestoreProducts);
        localStorage.setItem('echove_products', JSON.stringify(firestoreProducts));
      }
    }).catch((err) => {
      console.error('Error loading products from Firestore:', err);
    });
  }, []);

  // Save cart to localStorage on changes
  const saveCart = (items: CartItem[]) => {
    setCartItems(items);
    localStorage.setItem('echove_cart', JSON.stringify(items));
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('echove_user', JSON.stringify(loggedInUser));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('echove_user');
  };


  const handleAddToCart = (product: Product, size: string) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size
    );

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      saveCart(updated);
    } else {
      const newItem: CartItem = {
        product,
        quantity: 1,
        selectedSize: size,
      };
      saveCart([...cartItems, newItem]);
    }
  };

  const handleUpdateQuantity = (productId: string, size: string, change: number) => {
    const updated = cartItems
      .map((item) => {
        if (item.product.id === productId && item.selectedSize === size) {
          return { ...item, quantity: Math.max(1, item.quantity + change) };
        }
        return item;
      });
    saveCart(updated);
  };

  const handleRemoveItem = (productId: string, size: string) => {
    const updated = cartItems.filter(
      (item) => !(item.product.id === productId && item.selectedSize === size)
    );
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailOpen(true);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-denim-dark text-white flex flex-col justify-between font-sans selection:bg-mustard selection:text-denim-dark">
      
      {/* Top Header & Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        cartCount={totalCartCount}
        setIsCartOpen={setIsCartOpen}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={handleSignOut}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenTracking={() => setIsTrackingOpen(true)}
      />

      {/* Main Pages Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <div className="animate-in fade-in duration-500">
            {/* Hero Banner Section */}
            <Hero
              onExploreShop={() => setCurrentTab('shop')}
              onDonateJeans={() => setCurrentTab('donor')}
            />

            {/* Home Best Sellers Block */}
            <section className="py-20 bg-denim-dark border-b border-white/5 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* Section Title */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <span className="text-orange-earth font-mono text-xs font-black tracking-widest uppercase block mb-1">
                    MUST-HAVE 1-OF-1 PIECES
                  </span>
                  <h2 className="font-display font-black text-4xl sm:text-5xl tracking-tight text-white uppercase">
                    BST BEST SELLERS
                  </h2>
                  <div className="w-16 h-1 bg-mustard mx-auto mt-3 rotate-[-1.5deg]"></div>
                  <p className="font-sans text-white/50 text-sm mt-4 font-light">
                    Những thiết kế deconstructed được yêu thích nhất của ECHOVE, tái cấu trúc từ các form quần jean cổ điển. Xem ngay trước khi bị “snatch” mất nhé!
                  </p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {products.filter(p => p.isBestSeller).map((product) => (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      className="group cursor-pointer bg-ash-dark/40 border border-white/10 hover:border-mustard/60 transition-all duration-300 flex flex-col justify-between h-full hover:-translate-y-1 relative"
                    >
                      <div className="absolute top-3 left-3 z-10">
                        <span className="bg-orange-earth text-white font-display text-xs tracking-wider uppercase px-2 py-0.5 rotate-[-2deg] font-bold">
                          1-of-1 Độc bản
                        </span>
                      </div>
                      
                      <div className="aspect-square bg-denim-light overflow-hidden relative">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="p-5 space-y-3">
                        <div className="flex justify-between items-center text-xs font-mono text-white/40">
                          <span>{product.category.toUpperCase()}</span>
                          <span>X{product.originalJeansCount} JEAN CŨ</span>
                        </div>
                        <h3 className="font-display font-bold text-2xl text-white group-hover:text-mustard transition-colors line-clamp-1">
                          {product.name}
                        </h3>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                          <span className="font-mono font-bold text-mustard">{product.price.toLocaleString('vi-VN')} ₫</span>
                          <span className="font-display text-xs tracking-widest text-white/50 group-hover:text-white transition-colors">
                            CHI TIẾT ➔
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View All CTA */}
                <div className="text-center mt-12">
                  <button
                    onClick={() => {
                      setCurrentTab('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center space-x-2 border-2 border-white/10 hover:border-white/50 px-6 py-3 font-display text-lg tracking-widest transition-all rounded-xs cursor-pointer"
                  >
                    <span>XEM TOÀN BỘ CỬA HÀNG</span>
                    <span>➔</span>
                  </button>
                </div>

              </div>
            </section>

            {/* Brand Core Values Block */}
            <CoreValues />

            {/* Social Club/Community Feed */}
            <Community />
          </div>
        )}

        {currentTab === 'shop' && (
          <div className="animate-in fade-in duration-500">
            <Collection
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              products={products}
            />
          </div>
        )}

        {currentTab === 'donor' && (
          <div className="animate-in fade-in duration-500">
            <DonorPage user={user} />
          </div>
        )}

        {currentTab === 'about' && (
          <div className="animate-in fade-in duration-500">
            <AboutPage />
          </div>
        )}

        {currentTab === 'admin' && (
          <div className="animate-in fade-in duration-500">
            <AdminDashboard 
              user={user} 
              onProductUpdate={(updated) => setProducts(updated)} 
            />
          </div>
        )}
      </main>

      {/* Elegant Dark Brand Ticker */}
      <div className="bg-white text-black py-3 overflow-hidden border-y border-white/10 select-none relative z-10">
        <div className="animate-marquee flex gap-16 font-display font-black text-lg sm:text-xl tracking-[0.2em] uppercase">
          <span>* TÁI SINH THỜI TRANG *</span>
          <span className="text-denim-indigo">UPCYCLED IN VIETNAM</span>
          <span>* NO PLASTIC PACKAGING *</span>
          <span className="text-denim-indigo">HỖ TRỢ THANH TOÁN COD</span>
          <span>* UNIQUE PIECES ONLY *</span>
          <span className="text-denim-indigo">JEAN CŨ CHUYỆN MỚI</span>
          
          <span>* TÁI SINH THỜI TRANG *</span>
          <span className="text-denim-indigo">UPCYCLED IN VIETNAM</span>
          <span>* NO PLASTIC PACKAGING *</span>
          <span className="text-denim-indigo">HỖ TRỢ THANH TOÁN COD</span>
          <span>* UNIQUE PIECES ONLY *</span>
          <span className="text-denim-indigo">JEAN CŨ CHUYỆN MỚI</span>

          <span>* TÁI SINH THỜI TRANG *</span>
          <span className="text-denim-indigo">UPCYCLED IN VIETNAM</span>
          <span>* NO PLASTIC PACKAGING *</span>
          <span className="text-denim-indigo">HỖ TRỢ THANH TOÁN COD</span>
          <span>* UNIQUE PIECES ONLY *</span>
          <span className="text-denim-indigo">JEAN CŨ CHUYỆN MỚI</span>
        </div>
      </div>

      {/* Brand Footer */}
      <footer className="bg-ash-dark text-white border-t border-white/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Column 1: Brand Pitch (4 Columns) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center">
              <div className="bg-white px-2.5 py-1.5 rounded-xs shadow-md flex items-center justify-center">
                <img src={logo} alt="ECHOVE Logo" className="h-5 w-auto object-contain" />
              </div>
            </div>
            <p className="font-sans text-xs sm:text-sm text-white/50 leading-relaxed font-light">
              ECHOVE là thương hiệu thời trang tái chế denim phong cách Urban Streetwear tiên phong tại Việt Nam. Tụi mình thiết kế thủ công các sản phẩm 1-of-1 từ denim cũ quyên góp nhằm lan tỏa lối sống có ý thức và bùng nổ cá tính.
            </p>
            <div className="flex space-x-3 pt-2">
              <a href="https://www.facebook.com/echove.official" target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/10 hover:border-mustard hover:text-mustard transition-all rounded-xs text-white/70" title="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://instagram.com/echove.official" target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/10 hover:border-mustard hover:text-mustard transition-all rounded-xs text-white/70" title="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://tiktok.com/@echove.official" target="_blank" rel="noreferrer" className="p-2 bg-white/5 border border-white/10 hover:border-mustard hover:text-mustard transition-all rounded-xs text-white/70 flex items-center justify-center" title="TikTok">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.14 2.28 1.89 3.73 2.15v3.91c-1.24-.04-2.49-.37-3.6-.96-.91-.5-1.7-.19-2.31.54-.15.18-.32.35-.5.51v7.69c.04 1.6-.33 3.23-1.14 4.62-.89 1.56-2.31 2.76-4.01 3.32-1.89.65-4.01.54-5.83-.33-1.85-.86-3.32-2.45-3.99-4.39-.73-2.07-.46-4.42.72-6.27.97-1.56 2.51-2.65 4.31-2.99 1.15-.22 2.34-.11 3.44.3v4.06c-.84-.27-1.78-.34-2.62-.07-.71.22-1.35.68-1.76 1.3-.49.71-.62 1.63-.35 2.47.26.85.91 1.54 1.74 1.84.81.3 1.73.22 2.47-.23.63-.37 1.05-.98 1.17-1.71.07-.63.04-1.28.04-1.92V0z" />
                </svg>
              </a>
              <a href="mailto:echove.official@gmail.com" className="p-2 bg-white/5 border border-white/10 hover:border-mustard hover:text-mustard transition-all rounded-xs text-white/70" title="Email">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Navigation Links (3 Columns) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-display font-bold text-lg tracking-wider uppercase text-mustard">MỤC ĐƯỜNG DẪN</h4>
            <ul className="space-y-2 text-xs sm:text-sm font-sans text-white/60">
              <li>
                <button onClick={() => { setCurrentTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-mustard transition-colors flex items-center cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 mr-1 text-orange-earth" />
                  <span>Trang chủ</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('shop'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-mustard transition-colors flex items-center cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 mr-1 text-orange-earth" />
                  <span>Cửa hàng độc bản</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('donor'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-mustard transition-colors flex items-center cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 mr-1 text-orange-earth" />
                  <span>Quyên góp jean cũ</span>
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-mustard transition-colors flex items-center cursor-pointer">
                  <ChevronRight className="w-3.5 h-3.5 mr-1 text-orange-earth" />
                  <span>Câu chuyện thương hiệu</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact & Address (5 Columns) */}
          <div className="md:col-span-5 space-y-4">
            <h4 className="font-display font-bold text-lg tracking-wider uppercase text-mustard">ECHOVE LAB HANOI</h4>
            <div className="space-y-3 text-xs sm:text-sm font-sans text-white/60">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-orange-earth shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Ngõ 12, Phố Chùa Bộc, Quận Đống Đa, Hà Nội (Địa điểm nhận đồ trực tiếp và xưởng thiết kế chính của tụi mình)
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-orange-earth shrink-0" />
                <span>Hotline dạo phố: 0912.ECHOVE (0912.324.683)</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-orange-earth shrink-0" />
                <span>Email Lab: echove.official@gmail.com</span>
              </div>
            </div>
            
            <div className="pt-2">
              <span className="inline-flex items-center space-x-1.5 bg-white/5 border border-white/10 text-white/40 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5">
                <span>⚡ COD ONLY • FREE SHIP VIETNAM</span>
              </span>
            </div>
          </div>

        </div>

        {/* Bottom copyright bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-white/5 text-center text-[11px] font-mono text-white/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 ECHOVE Studio. All Rights Reserved. Bản quyền thuộc về tụi mình dạo phố.</p>
          <p className="text-mustard hover:underline">Sản phẩm thời trang tuần hoàn vì một Việt Nam xanh rực rỡ.</p>
        </div>
      </footer>

      {/* Product Detail Modal Popup */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedProduct(null);
        }}
        onAddToCart={handleAddToCart}
      />

      {/* Cart Drawer Slide-over */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        user={user}
      />

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Tracking Modal Popup */}
      <TrackingModal
        isOpen={isTrackingOpen}
        onClose={() => setIsTrackingOpen(false)}
        user={user}
      />

    </div>
  );
}

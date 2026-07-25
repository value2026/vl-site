import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, FlaskConical, LogOut } from 'lucide-react';
import { navLinks } from '../data/navLinks';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

async function fetchHomeSections() {
  const res = await fetch(`${import.meta.env.VITE_API_URL || window.location.origin}/api/pages/home/sections`);
  if (!res.ok) throw new Error('Failed to fetch home sections');
  return res.json();
}

export default function Header() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    const map = {
      admin:        '/dashboard/admin',
      vl_manager:   '/dashboard/vl-manager',
      nodal_centre: '/dashboard/nodal',
      teacher:      '/dashboard/teacher',
      student:      '/student',
    };
    return map[user.role] || '/student';
  };
  const [scrolled, setScrolled]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const headerRef = useRef(null);

  const { data: sections } = useQuery({
    queryKey: ['home-sections'],
    queryFn: fetchHomeSections,
    staleTime: 60_000,
  });

  const displayNavLinks = navLinks.filter(link => {
    if (link.label === 'News & Events') {
      if (sections) {
        const newsSection = sections.find(s => s.sectionKey === 'news');
        if (newsSection && !newsSection.isVisible) return false;
      }
    }
    return true;
  });

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (headerRef.current && !headerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const isActive = (href) =>
    href === '/' ? location.pathname === '/' : location.pathname.startsWith(href);

  return (
    <header ref={headerRef} className="w-full z-50">
      {/* Top Banner (Logos) - Static */}
      <div className={`bg-white transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden opacity-0 py-0' : 'py-4 opacity-100'}`}>
        <div className="container-custom flex items-center justify-between">
          {/* Custom Logo from Image */}
          <Link to="/" className="flex flex-col justify-center flex-shrink-0 group" aria-label="VALUE @ Amrita Home">
            <div className="flex items-baseline mt-1">
              <span className="text-primary-800 text-[2rem] font-black tracking-tighter uppercase font-heading">
                VALUE
              </span>
              <span className="text-slate-600 text-[2rem] font-light ml-1.5 font-heading">
                @ Amrita
              </span>
            </div>
            <span className="text-slate-500 text-[12px] font-semibold tracking-wider mt-0.5 uppercase">
              Virtual Amrita Laboratories Universalizing Education
            </span>
          </Link>

          {/* Right Logo */}
          <Link to="/" className="hidden md:block flex-shrink-0 group">
            <img 
              src="/amrita-logo.jpg" 
              alt="Amrita Vishwa Vidyapeetham" 
              className="h-10 sm:h-[3.25rem] w-auto object-contain transition-transform group-hover:scale-105" 
            />
          </Link>
        </div>
      </div>

      {/* Navigation Bar - Sticky */}
      <div className={`transition-all duration-300 ${scrolled ? 'fixed top-0 left-0 right-0 shadow-md bg-white/95 backdrop-blur-xl border-b border-slate-200 z-50' : 'bg-white border-y border-slate-200 z-40 relative shadow-sm'}`}>
        <div className="container-custom">
          <div className="flex items-center justify-between h-14">
            
            {/* Desktop Navigation */}
            <nav className="hidden xl:flex items-center gap-1.5" aria-label="Main navigation">
              {displayNavLinks.map((link) =>
                link.children ? (
                  <div key={link.label} className="relative flex-shrink-0">
                    <button
                      className={`flex items-center gap-1 px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap transition-all duration-300 ${
                        isActive(link.href)
                          ? 'text-primary-800 bg-primary-50'
                          : 'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                      }`}
                      onClick={() =>
                        setOpenDropdown(openDropdown === link.label ? null : link.label)
                      }
                      aria-expanded={openDropdown === link.label}
                      aria-haspopup="true"
                    >
                      <span className="whitespace-nowrap">{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
                          openDropdown === link.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {openDropdown === link.label && (
                      <div className="absolute top-full left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-100 py-2.5 animate-slide-down z-50 overflow-hidden ring-1 ring-black/5">
                        {link.children.map((child) => (
                          <Link
                            key={child.label}
                            to={child.href}
                            className="block px-5 py-2.5 text-[14px] font-semibold text-gray-600 hover:text-primary-800 hover:bg-gray-50 transition-colors whitespace-nowrap"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    className={`px-4 py-2 rounded-full text-[14px] font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-300 ${
                      isActive(link.href)
                        ? 'text-primary-800 bg-primary-50'
                        : 'text-gray-600 hover:text-primary-800 hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Login/Dashboard Button */}
            <div className="hidden xl:flex items-center gap-4">
              {user ? (
                <>
                  <Link to={getDashboardLink()} className="text-[14px] font-semibold text-gray-600 hover:text-primary-800 transition-colors px-2">
                    {user?.role === 'student' ? 'Student Platform' : 'Dashboard'}
                  </Link>
                  <button 
                    onClick={() => setShowSignOutModal(true)}
                    className="bg-primary-800 hover:bg-primary-900 text-white transition-all rounded-full px-5 py-2 font-bold text-[14px] flex items-center gap-2 whitespace-nowrap flex-shrink-0 shadow-sm"
                  >
                    <LogOut className="w-4 h-4 flex-shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link to="/login" className="bg-primary-800 hover:bg-primary-900 text-white transition-all rounded-full px-6 py-2 font-bold text-[14px] whitespace-nowrap flex-shrink-0 shadow-md hover:shadow-lg hover:-translate-y-0.5">
                  Sign In
                </Link>
              )}
            </div>

            {/* Hamburger */}
            <div className="flex xl:hidden justify-between w-full items-center">
              {/* Show compact logo on mobile nav bar when top banner is hidden on scroll */}
              <div className={`transition-opacity duration-300 ${scrolled ? 'opacity-100 visible' : 'opacity-0 invisible hidden'}`}>
                <span className="font-heading font-black text-primary-800 text-lg tracking-tighter whitespace-nowrap">
                  VALUE <span className="font-light text-slate-600">@ Amrita</span>
                </span>
              </div>
              <div className={scrolled ? '' : 'ml-auto'}>
                <button
                  className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-primary-500/20 outline-none"
                  onClick={() => setMobileOpen(!mobileOpen)}
                  aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={mobileOpen}
                >
                  {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-xl animate-slide-down relative z-40">
          <nav className="container-custom py-3 space-y-0.5" aria-label="Mobile navigation">
            {displayNavLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-800 transition-colors"
                    onClick={() =>
                      setOpenDropdown(openDropdown === link.label ? null : link.label)
                    }
                  >
                    {link.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openDropdown === link.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openDropdown === link.label && (
                    <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-primary-100 pl-3">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="block px-4 py-2 text-[14px] font-semibold text-gray-600 hover:text-primary-800 transition-colors"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`block px-4 py-3 rounded-xl text-[14px] font-semibold transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-primary-800'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-3 border-t border-slate-100 mt-2 space-y-2 pb-2">
              {user ? (
                <>
                  <Link to={getDashboardLink()} className="block px-4 py-3 rounded-xl text-[14px] font-semibold text-gray-700 hover:bg-gray-50 hover:text-primary-800 transition-colors">
                    {user?.role === 'student' ? 'Student Platform' : 'Dashboard'}
                  </Link>
                  <button 
                    onClick={() => setShowSignOutModal(true)}
                    className="w-full flex items-center justify-center bg-primary-800 hover:bg-primary-900 text-white shadow-sm rounded-xl py-3 text-[14px] font-bold gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center w-full bg-primary-800 hover:bg-primary-900 text-white shadow-sm rounded-xl py-3 text-[14px] font-bold transition-colors">
                  Sign In
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
      {/* Sign Out Confirmation Modal */}
      {showSignOutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-scale-up">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Sign Out</h3>
            <p className="text-slate-600 mb-6">Are you sure you want to sign out of your account?</p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowSignOutModal(false)}
                className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowSignOutModal(false);
                  logout();
                }}
                className="px-5 py-2.5 font-bold text-white bg-primary-800 hover:bg-primary-900 rounded-xl transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

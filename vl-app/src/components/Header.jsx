import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, FlaskConical } from 'lucide-react';
import { navLinks } from '../data/navLinks';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const location = useLocation();
  const headerRef = useRef(null);

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
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white shadow-sm'
      }`}
    >
      <div className="container-custom">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="Virtual Labs Home"
          >
            <div className="w-9 h-9 bg-primary-800 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <FlaskConical className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <span className="block font-heading font-bold text-primary-800 text-lg leading-none">
                Virtual Labs
              </span>
              <span className="block text-[10px] text-gray-400 font-medium tracking-wide uppercase">
                Ministry of Education
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
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
                    {link.label}
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${
                        openDropdown === link.label ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openDropdown === link.label && (
                    <div className="absolute top-full left-0 mt-1.5 w-52 bg-white rounded-xl shadow-card-hover border border-gray-100 py-1.5 animate-slide-down z-50">
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.href}
                          className="block px-4 py-2.5 text-sm text-gray-600 hover:text-primary-800 hover:bg-primary-50 transition-colors"
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
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
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

          {/* Login Button */}
          <div className="hidden lg:flex items-center gap-3">
            <Link to="/login" className="btn-primary text-sm px-5 py-2.5">
              Login
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-down">
          <nav className="container-custom py-3 space-y-0.5" aria-label="Mobile navigation">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label}>
                  <button
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-800 transition-colors"
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
                          className="block px-3 py-2 text-sm text-gray-600 hover:text-primary-800 transition-colors"
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
                  className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? 'bg-primary-50 text-primary-800'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-800'
                  }`}
                >
                  {link.label}
                </Link>
              )
            )}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <Link to="/login" className="btn-primary w-full justify-center text-sm">
                Login
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

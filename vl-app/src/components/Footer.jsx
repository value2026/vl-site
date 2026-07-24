import { Link } from 'react-router-dom';
import {
  FlaskConical, Mail, Phone, MapPin,
  AtSign, Rss, Globe, Share2,
} from 'lucide-react';

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Project', href: '/project' },
  { label: 'Workshop', href: '/workshop' },
  { label: 'Nodal Centres', href: '/nodal-centres' },
  { label: 'Publications', href: '/publications' },
  { label: 'Contact', href: '/contact' },
];

const labLinks = [
  { label: 'Biotechnology', href: '/labs/biotechnology' },
  { label: 'Chemical Sciences', href: '/labs/chemical-sciences' },
  { label: 'Physical Sciences', href: '/labs/physical-sciences' },
  { label: 'Computer Science', href: '/labs/computer-science' },
  { label: 'Mechanical Engg.', href: '/labs/mechanical-engineering' },
];

const socials = [
  { Icon: AtSign,  href: '#', label: 'Twitter/X' },
  { Icon: Globe,   href: '#', label: 'Website' },
  { Icon: Rss,     href: '#', label: 'RSS Feed' },
  { Icon: Share2,  href: '#', label: 'Share' },
];

export default function Footer() {
  return (
    <footer className="bg-[#111622] text-slate-400" aria-label="Site footer">
      <div className="container-custom py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3.5 mb-6">
              <div className="bg-white p-2.5 rounded-[1.25rem] shadow-sm flex items-center justify-center flex-shrink-0">
                <img src="/amrita-icon.jpg" alt="Amrita Logo" className="w-8 h-8 object-contain" />
              </div>
              <div className="flex flex-col justify-center pt-1">
                <span className="block text-white font-bold text-[1rem] leading-none tracking-wide" style={{ fontFamily: 'Arial, sans-serif' }}>
                  VALUE @ Amrita
                </span>
                <span className="block text-[11px] text-[#A51C4A] font-bold tracking-[0.08em] uppercase mt-1.5">
                  Amrita Vishwa Vidyapeetham
                </span>
              </div>
            </div>
            <p className="text-sm leading-relaxed mb-6 text-gray-400">
              An initiative by Amrita Vishwa Vidyapeetham under NMEICT, Ministry of Education, Government of India — providing
              quality virtual laboratory experiences for students across India.
            </p>
            <div className="flex gap-3">
              {socials.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-11 h-11 bg-transparent hover:bg-white/5 border border-slate-700/80 rounded-[0.85rem] flex items-center justify-center transition-colors duration-200 text-slate-400 hover:text-white"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-sm hover:text-white hover:translate-x-1 inline-flex transition-all duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Lab links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Lab Categories
            </h3>
            <ul className="space-y-2.5">
              {labLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-sm hover:text-white hover:translate-x-1 inline-flex transition-all duration-150"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-5">
              Contact Us
            </h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <MapPin className="w-4 h-4 text-primary-400 flex-shrink-0 mt-0.5" />
                <span>
                  Virtual Labs Project<br />
                  IIT Bombay, Powai<br />
                  Mumbai — 400 076
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="mailto:support@vlabs.ac.in" className="hover:text-white transition-colors">
                  support@vlabs.ac.in
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary-400 flex-shrink-0" />
                <a href="tel:+912225767062" className="hover:text-white transition-colors">
                  +91 22 2576 7062
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/5">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} Virtual Labs — Ministry of Education, India. All rights reserved.</span>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

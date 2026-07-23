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
    <footer className="bg-gray-900 text-gray-400" aria-label="Site footer">
      <div className="container-custom py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 bg-primary-800 rounded-xl flex items-center justify-center shadow-md">
                <FlaskConical className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="block text-white font-heading font-bold text-lg leading-none">
                  Amrita Virtual Labs
                </span>
                <span className="block text-[10px] text-primary-300 font-semibold tracking-wider uppercase mt-0.5">
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
                  className="w-9 h-9 bg-white/5 hover:bg-primary-800 border border-white/10 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4" />
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

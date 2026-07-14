import { Link } from 'react-router-dom';
import { Download, MapPin, MonitorPlay, ArrowRight } from 'lucide-react';

const ctaCards = [
  {
    id: 'brochure',
    Icon: Download,
    title: 'Download Brochure',
    description:
      'Get the complete guide to Virtual Labs including lab list, institution details, and usage instructions.',
    action: 'Download PDF',
    href: '#',
    gradient: 'from-primary-800 to-primary-900',
    iconBg: 'bg-primary-700',
    external: false,
  },
  {
    id: 'nodal',
    Icon: MapPin,
    title: 'Become a Nodal Centre',
    description:
      'Bring Virtual Labs to your institution. Apply to become a registered nodal centre and enable your students.',
    action: 'Apply Now',
    href: '/nodal-centres/apply',
    gradient: 'from-accent-500 to-blue-700',
    iconBg: 'bg-blue-500',
    external: false,
  },
  {
    id: 'demo',
    Icon: MonitorPlay,
    title: 'Register for Free Demo',
    description:
      'Book a live online demonstration of Virtual Labs for your faculty and students — completely free of charge.',
    action: 'Register Free',
    href: '/nodal-centres/demo',
    gradient: 'from-secondary-500 to-orange-500',
    iconBg: 'bg-secondary-400',
    external: false,
  },
];

export default function CTASection() {
  return (
    <section className="py-20 bg-gray-50" aria-labelledby="cta-heading">
      <div className="container-custom">
        <div className="text-center mb-12">
          <span className="tag">Get Involved</span>
          <h2 id="cta-heading" className="section-title mt-4">
            Take the Next Step
          </h2>
          <p className="section-subtitle">
            Whether you're a student, faculty, or institution — Virtual Labs has something for you.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {ctaCards.map(({ id, Icon, title, description, action, href, gradient, iconBg }) => (
            <div
              key={id}
              className={`bg-gradient-to-br ${gradient} rounded-2xl p-8 text-white flex flex-col group hover:scale-105 transition-transform duration-300 shadow-card hover:shadow-card-hover`}
            >
              <div className={`w-14 h-14 ${iconBg} bg-opacity-60 rounded-xl flex items-center justify-center mb-6`}>
                <Icon className="w-7 h-7 text-white" />
              </div>

              <h3 className="font-heading text-xl font-bold mb-3">{title}</h3>
              <p className="text-white/75 text-sm leading-relaxed flex-1 mb-7">{description}</p>

              <Link
                to={href}
                id={`cta-${id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg px-5 py-2.5 transition-all duration-200 self-start"
              >
                {action}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

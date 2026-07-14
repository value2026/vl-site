import { Link } from 'react-router-dom';
import { ArrowRight, FlaskConical } from 'lucide-react';
import { labs } from '../data/labs';

export default function LabCategories() {
  return (
    <section className="py-24 bg-white" aria-labelledby="labs-heading">
      <div className="container-custom">
        <div className="text-center mb-16">
          <span className="tag">Disciplines</span>
          <h2 id="labs-heading" className="section-title mt-4">
            Explore Virtual Lab Categories
          </h2>
          <p className="section-subtitle">
            From biotechnology to mechanical engineering — we cover every core STEM discipline.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {labs.map((lab) => (
            <Link
              key={lab.id}
              to={lab.href}
              id={`lab-${lab.id}`}
              className="card group p-7 flex flex-col border border-gray-100 hover:border-transparent"
            >
              {/* Icon row */}
              <div className="flex items-start justify-between mb-5">
                <div className={`w-14 h-14 ${lab.bgColor} ${lab.borderColor} border rounded-2xl flex items-center justify-center text-3xl`}>
                  {lab.icon}
                </div>
                <span className={`text-xs font-semibold ${lab.textColor} ${lab.bgColor} px-2.5 py-1 rounded-full`}>
                  {lab.experiments} exps
                </span>
              </div>

              {/* Title */}
              <h3 className="font-heading text-lg font-bold text-gray-900 mb-3 leading-snug group-hover:text-primary-800 transition-colors">
                {lab.title}
              </h3>

              {/* Description */}
              <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-6">
                {lab.description}
              </p>

              {/* CTA */}
              <div className="flex items-center gap-2 text-sm font-semibold text-primary-800 group-hover:gap-3 transition-all">
                Explore Labs
                <ArrowRight className="w-4 h-4" />
              </div>

              {/* Bottom gradient bar */}
              <div className={`mt-5 h-0.5 w-0 group-hover:w-full bg-gradient-to-r ${lab.color} rounded-full transition-all duration-500`} />
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/labs" className="btn-outline-primary">
            <FlaskConical className="w-4 h-4" />
            View All Labs
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

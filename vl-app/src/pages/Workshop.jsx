import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Loader2, CheckCircle2, ChevronRight, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../utils/api';
import { renderFormattedText } from '../utils/formatText';
import { Link } from 'react-router-dom';
import WorkshopRegistrationModal from '../components/public/WorkshopRegistrationModal';
import NodalCentreRequestModal from '../components/public/NodalCentreRequestModal';

async function fetchWorkshops() {
  const res = await fetch(apiUrl("/workshops"));
  if (!res.ok) throw new Error('Failed to fetch workshops');
  return res.json();
}

async function fetchWorkshopSections() {
  const res = await fetch(apiUrl("/pages/workshop/sections"));
  if (!res.ok) throw new Error('Failed to fetch workshop sections');
  return res.json();
}

const modeColor = {
  Hybrid:    'bg-purple-100 text-purple-700 border-purple-200',
  'In-person': 'bg-green-100 text-green-700 border-green-200',
  Online:    'bg-blue-100 text-blue-700 border-blue-200',
};

export default function Workshop() {
  const { data: workshops, isLoading } = useQuery({
    queryKey: ['workshops-list'],
    queryFn: fetchWorkshops,
    staleTime: 60_000,
    retry: 1,
  });

  const { data: sections } = useQuery({
    queryKey: ['workshop-sections'],
    queryFn: fetchWorkshopSections,
    staleTime: 60_000,
    retry: 1,
  });

  const [registeringWorkshop, setRegisteringWorkshop] = useState(null);
  const [requestingNodalCentre, setRequestingNodalCentre] = useState(false);

  const workshopsList = (workshops || []).filter(w => w.status === 'approved');

  // Extract sections from dynamic content
  let heroSec = null;
  let introSec = null;
  let forumSec = null;
  let ctaSec = null;

  if (sections && Array.isArray(sections)) {
    heroSec = sections.find(s => s.sectionKey === 'workshop_hero' || s.sectionKey === 'hero');
    introSec = sections.find(s => s.sectionKey === 'workshop_intro');
    forumSec = sections.find(s => s.sectionKey === 'workshop_forum');
    ctaSec = sections.find(s => s.sectionKey === 'workshop_cta');
  }

  const heroTitle = heroSec?.title || 'Virtual Labs Workshops';
  const heroSubtitle = heroSec?.subtitle || 'Empowering educators and students through immersive, hands-on digital laboratory training.';
  const heroTag = heroSec?.content?.tag || 'Workshops';

  const defaultP1 = "Amrita Vishwa Vidyapeetham's VALUE project is running a series of workshops on Virtual Labs in Physical & Chemical Sciences, Biological Sciences, Mechanical Engineering and Computer Science. These workshops will offer an introduction to the innovative world of Virtual Laboratories for both physical and chemical sciences.";
  const defaultP2 = "Virtual Labs are a new immersive e-learning tool that provides a media-rich, interactive user interface that teachers can use to supplement their curriculum. These Virtual Labs are located on an open webpage that can be accessed by anyone through a web browser, on any Internet-connected computer in the world. A variety of laboratory experiments can be conducted virtually using animation, simulation or remotely triggered hardware. Laboratory experiments are modeled very close to real-life experiments and when used as a learning tool by students it allows them to learn the material more efficiently and can actually make doing the practical experiments easier.";
  const defaultP3 = "The workshop offers a fantastic opportunity for all faculty members involved in the education of physics, chemistry, biological sciences, computer science and mechanical engineering to learn more about Virtual Labs. We will showcase our online laboratory experiments including a hands-on training session in using the Virtual Labs website.";
  const defaultInitiative = "This project is an initiative of MoE (Ministry of Education) under National Mission on Education through ICT (NME-ICT). These experiments and labs are hosted for open access through www.vlab.co.in.";

  const introP1 = introSec?.content?.p1 || defaultP1;
  const introP2 = introSec?.content?.p2 || defaultP2;
  const introP3 = introSec?.content?.p3 || defaultP3;
  const introInitiative = introSec?.content?.initiativeText || defaultInitiative;
  const introImage = introSec?.content?.imageUrl || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";

  const customBlocks = introSec?.content?.customBlocks;
  const hasCustomBlocks = Array.isArray(customBlocks) && customBlocks.length > 0;

  const forumTitle = forumSec?.title || 'Nodal Centre Forum';
  const forumP1 = forumSec?.content?.p1 || "Nodal Centre Forum will be held in addition to the workshop. This is an exciting new venture which allows people to follow the progress of the VALUE Virtual Labs and provides a platform for everyone to contribute towards the future development of labs and experiments.";
  const forumP2 = forumSec?.content?.p2 || "By simply registering your institution you benefit from a whole host of services and resources. Nodal Centres as proposed by MoE (Ministry of Education) will help promote the use of Virtual Labs in Higher Education.";
  const forumBtnLabel = forumSec?.content?.btnLabel || "Learn more about Nodal Centres →";
  const forumBtnHref = forumSec?.content?.btnHref || "/nodal-centres";

  const ctaTitle = ctaSec?.title || 'Host a Workshop at Your Institute';
  const ctaSubtitle = ctaSec?.subtitle || 'Are you interested to conduct a workshop at your institute? Bring the Virtual Labs experience directly to your faculty and students.';
  const ctaBtnLabel = ctaSec?.content?.btnLabel || "Submit a Request";

  return (
    <main className="bg-slate-50 min-h-screen">
      
      {/* Page Header */}
      <section className="bg-hero-gradient py-12">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            {heroTag}
          </span>
          <h1 className="font-heading text-4xl font-extrabold text-white mb-4">
            {heroTitle}
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
              {hasCustomBlocks ? (
                customBlocks.map((block, idx) => {
                  const bType = (block.type || 'paragraph').toLowerCase().trim();
                  if (bType === 'heading' || bType === 'h2' || bType === 'h3') {
                    return (
                      <h3 key={idx} className="font-heading text-xl font-bold text-slate-900 mt-4 mb-2">
                        {renderFormattedText(block.text)}
                      </h3>
                    );
                  }
                  if (bType === 'note' || bType === 'callout' || bType === 'italic') {
                    return (
                      <p key={idx} className="italic text-slate-500 text-sm border-l-4 border-blue-500 pl-4 py-1.5 bg-blue-50/20 rounded-r-lg">
                        {renderFormattedText(block.text)}
                      </p>
                    );
                  }
                  if (bType === 'link') {
                    return (
                      <div key={idx} className="pt-1">
                        <a
                          href={block.linkUrl || block.href || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-semibold underline text-sm"
                        >
                          {renderFormattedText(block.text || block.linkUrl || 'Visit Link')}
                        </a>
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="leading-relaxed">
                      {renderFormattedText(block.text)}
                    </p>
                  );
                })
              ) : (
                <>
                  {introP1 && (
                    <p className="leading-relaxed">
                      {renderFormattedText(introP1)}
                    </p>
                  )}
                  {introP2 && (
                    <p className="leading-relaxed">
                      {renderFormattedText(introP2)}
                    </p>
                  )}
                  {introP3 && (
                    <p className="leading-relaxed">
                      {renderFormattedText(introP3)}
                    </p>
                  )}
                  {introInitiative && (
                    <p className="italic text-slate-500 text-sm border-l-4 border-blue-500 pl-4 py-1.5 bg-blue-50/20 rounded-r-lg">
                      {renderFormattedText(introInitiative)}
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-3xl transform rotate-2"></div>
              <img 
                src={introImage} 
                alt="Virtual Labs Workshop in progress" 
                className="relative z-10 rounded-2xl shadow-2xl object-cover h-[450px] w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Workshops Schedule Table */}
      <section className="py-16">
        <div className="container-custom">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Upcoming Schedule</h2>
            <p className="text-slate-500">For workshop details please refer to the upcoming events below:</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            {isLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : workshopsList.length === 0 ? (
              <div className="text-center text-slate-500 py-20">
                No upcoming workshops are currently scheduled. Please check back later.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-4 px-6">Event Name</th>
                      <th className="py-4 px-6">Date & Time</th>
                      <th className="py-4 px-6">Location</th>
                      <th className="py-4 px-6">Mode</th>
                      <th className="py-4 px-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {workshopsList.map((w) => {
                      const dateObj = new Date(w.date);
                      const formattedDate = dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-4 px-6 font-semibold text-slate-900">
                            {w.title}
                            {w.institution && (
                              <div className="text-xs font-normal text-slate-500 mt-0.5">
                                {w.institution}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              {formattedDate}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                              <span>{w.location || 'Virtual Labs Platform'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${modeColor[w.mode] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                              {w.mode || 'Online'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <button
                              onClick={() => setRegisteringWorkshop(w)}
                              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm hover:shadow"
                            >
                              Register
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Nodal Centre & CTA Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-200 relative overflow-hidden">
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto space-y-16">
            
            <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 rounded-3xl p-8 md:p-10 shadow-[0_20px_40px_rgba(79,70,229,0.25)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
              <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400"></div>
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                  {forumTitle}
                </h3>
                <p className="leading-relaxed text-indigo-50 mb-4">
                  {renderFormattedText(forumP1)}
                </p>
                <p className="leading-relaxed text-indigo-50">
                  {renderFormattedText(forumP2)}
                </p>
                <div className="mt-8">
                  <Link to={forumBtnHref} className="inline-flex items-center gap-2 text-yellow-300 font-bold hover:text-yellow-200 transition-colors">
                    {forumBtnLabel} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center space-y-6 pt-4">
              <h3 className="text-3xl font-bold text-slate-900">
                {ctaTitle}
              </h3>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                {ctaSubtitle}
              </p>
              <button 
                onClick={() => setRequestingNodalCentre(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-[0_10px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.2)] transform hover:-translate-y-1"
              >
                <Mail className="w-5 h-5" />
                {ctaBtnLabel}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Registration Modal */}
      {registeringWorkshop && (
        <WorkshopRegistrationModal 
          workshop={registeringWorkshop} 
          onClose={() => setRegisteringWorkshop(null)} 
        />
      )}

      {/* Nodal Centre Request Modal */}
      {requestingNodalCentre && (
        <NodalCentreRequestModal onClose={() => setRequestingNodalCentre(false)} />
      )}
    </main>
  );
}

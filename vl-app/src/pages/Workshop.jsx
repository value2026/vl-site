import { useState } from 'react';
import { Calendar, MapPin, Clock, Users, ArrowRight, Loader2, CheckCircle2, ChevronRight, Mail } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiUrl } from '../utils/api';
import { Link } from 'react-router-dom';
import WorkshopRegistrationModal from '../components/public/WorkshopRegistrationModal';
import NodalCentreRequestModal from '../components/public/NodalCentreRequestModal';

async function fetchWorkshops() {
  const res = await fetch(apiUrl("/workshops"));
  if (!res.ok) throw new Error('Failed to fetch workshops');
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

  const [registeringWorkshop, setRegisteringWorkshop] = useState(null);
  const [requestingNodalCentre, setRequestingNodalCentre] = useState(false);

  const workshopsList = (workshops || []).filter(w => w.status === 'approved');

  return (
    <main className="bg-slate-50 min-h-screen">
      
      {/* Page Header */}
      <section className="bg-hero-gradient py-12">
        <div className="container-custom text-center">
          <span className="inline-block bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
            Workshops
          </span>
          <h1 className="font-heading text-4xl font-extrabold text-white mb-4">
            Virtual Labs Workshops
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Empowering educators and students through immersive, hands-on digital laboratory training.
          </p>
        </div>
      </section>

      {/* Intro Section - Matching the old structure but modern */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
              <p>
                <strong className="text-slate-900 font-semibold">Amrita Vishwa Vidyapeetham's VALUE project</strong> is running a series of workshops on Virtual Labs in Physical & Chemical Sciences, Biological Sciences, Mechanical Engineering and Computer Science. These workshops will offer an introduction to the innovative world of Virtual Laboratories for both physical and chemical sciences.
              </p>
              <p>
                Virtual Labs are a new immersive e-learning tool that provides a media-rich, interactive user interface that teachers can use to supplement their curriculum. These Virtual Labs are located on an open webpage that can be accessed by anyone through a web browser, on any Internet-connected computer in the world. A variety of laboratory experiments can be conducted virtually using animation, simulation or remotely triggered hardware. Laboratory experiments are modeled very close to real-life experiments and when used as a learning tool by students it allows them to learn the material more efficiently and can actually make doing the practical experiments easier.
              </p>
              <p>
                The workshop offers a fantastic opportunity for all faculty members involved in the education of physics, chemistry, biological sciences, computer science and mechanical engineering to learn more about Virtual Labs. We will showcase our online laboratory experiments including a hands-on training session in using the Virtual Labs website.
              </p>
              <p className="italic text-slate-500 text-sm border-l-4 border-blue-500 pl-4 py-1">
                This project is an initiative of Ministry of Human Resource Department under National Mission on Education through ICT (NME-ICT).
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-purple-50 rounded-3xl transform rotate-2"></div>
              <img 
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
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
                    <tr className="bg-slate-50 border-b border-slate-200 text-sm font-bold text-slate-700 uppercase tracking-wider">
                      <th className="px-6 py-4 w-1/4">Location / Event</th>
                      <th className="px-6 py-4 w-1/5">Date</th>
                      <th className="px-6 py-4 w-1/3">Venue</th>
                      <th className="px-6 py-4 w-1/5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workshopsList.map((w) => {
                      const dateObj = new Date(w.date);
                      const isPast = dateObj < new Date();
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5 align-top">
                            <div className="font-bold text-slate-900 text-base mb-1 group-hover:text-blue-600 transition-colors">
                              {w.title}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${modeColor[w.mode] || modeColor.Online}`}>
                                {w.mode || 'Online'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-start gap-2 text-slate-600 font-medium">
                              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                              <span>
                                {dateObj.toLocaleDateString('en-GB', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top">
                            <div className="flex items-start gap-2 text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                              <span className="leading-relaxed">
                                {w.location || (w.mode === 'Online' ? 'Virtual Labs Platform (Online)' : 'To be announced')}
                                {w.description && (
                                  <span className="block mt-1 text-sm text-slate-500">
                                    {w.description.length > 80 ? `${w.description.substring(0, 80)}...` : w.description}
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-5 align-top text-center">
                            {isPast ? (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-500 text-sm font-semibold border border-slate-200">
                                Closed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 text-sm font-semibold border border-blue-200">
                                Upcoming
                              </span>
                            )}
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
                  Nodal Centre Forum
                </h3>
                <p className="leading-relaxed text-indigo-50 mb-4">
                  <strong>Nodal Centre Forum</strong> will be held in addition to the workshop. This is an exciting new venture which allows people to follow the progress of the VALUE Virtual Labs and provides a platform for everyone to contribute towards the future development of labs and experiments.
                </p>
                <p className="leading-relaxed text-indigo-50">
                  By simply registering your institution you benefit from a whole host of services and resources. Nodal Centres as proposed by MHRD will help promote the use of Virtual Labs in Higher Education.
                </p>
                <div className="mt-8">
                  <Link to="/nodal-centres" className="inline-flex items-center gap-2 text-yellow-300 font-bold hover:text-yellow-200 transition-colors">
                    Learn more about Nodal Centres <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center space-y-6 pt-4">
              <h3 className="text-3xl font-bold text-slate-900">
                Host a Workshop at Your Institute
              </h3>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                Are you interested to conduct a workshop at your institute? Bring the Virtual Labs experience directly to your faculty and students.
              </p>
              <button 
                onClick={() => setRequestingNodalCentre(true)}
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-[0_10px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.2)] transform hover:-translate-y-1"
              >
                <Mail className="w-5 h-5" />
                Submit a Request
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

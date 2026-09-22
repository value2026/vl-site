import { useState } from 'react';
import { PlayCircle } from 'lucide-react';
import VideoPlayerModal from './VideoPlayerModal';

export default function MediaSection({ sectionTitle, sectionSubtitle, content = {} }) {
  const heading  = sectionTitle  || 'The Making of Virtual Labs';
  const subtitle = sectionSubtitle || "See how India's top institutions are transforming science education.";
  const tag      = content.sectionTag || 'Media';
  const [activeVideo, setActiveVideo] = useState(null);

  const DEFAULT_VIDEOS = [
    {
      id: 'v1',
      title: 'Amrita VALUE Virtual Labs Introduction',
      duration: '3:05 · Official Overview',
      videoUrl: 'https://www.youtube.com/watch?v=ViqHtlZSOjM',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 'v2',
      title: 'Virtual Labs: A Virtual Learning Environment',
      duration: '6:58 · Demonstration',
      videoUrl: 'https://www.youtube.com/watch?v=IwxOpEUXm6A',
      thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60'
    }
  ];

  const videos = content.videos?.length ? content.videos : DEFAULT_VIDEOS;

  return (
    <section className="py-10 md:py-14 bg-white border-t border-slate-200/70" aria-labelledby="media-heading">
      <div className="container-custom">
        <div className="text-center mb-8">
          <span className="tag">{tag}</span>
          <h2 id="media-heading" className="section-title mt-2 mb-2">
            {heading}
          </h2>
          <p className="section-subtitle">{subtitle}</p>
        </div>

        {/* Video grid area */}
        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((vid) => (
            <div 
              key={vid.id || vid.videoUrl} 
              onClick={() => setActiveVideo(vid)}
              className="relative rounded-3xl overflow-hidden shadow-card hover:shadow-card-hover group cursor-pointer transition-all duration-300"
            >
              <div className="bg-hero-gradient aspect-video flex items-center justify-center relative">
                {vid.thumbnailUrl ? (
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url("${vid.thumbnailUrl}")` }}
                  />
                ) : (
                  <div className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 30% 40%, #f4b400 0%, transparent 40%),
                                        radial-gradient(circle at 70% 60%, #2563eb 0%, transparent 40%)`
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-350" />

                <div className="relative flex flex-col items-center gap-3.5 z-10 text-center px-6">
                  <button
                    aria-label={`Watch ${vid.title}`}
                    className="group/btn"
                  >
                    <div className="w-16 h-16 bg-white/20 hover:bg-white/30 border-2 border-white/50 rounded-full flex items-center justify-center transition-all duration-300 group-hover/btn:scale-110">
                      <PlayCircle className="w-8 h-8 text-white" />
                    </div>
                  </button>
                  <p className="text-white font-semibold text-lg leading-snug drop-shadow-md">{vid.title}</p>
                  {vid.duration && <p className="text-white/60 text-xs tracking-wider uppercase font-semibold">{vid.duration}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      <VideoPlayerModal 
        isOpen={!!activeVideo}
        onClose={() => setActiveVideo(null)}
        videoUrl={activeVideo?.videoUrl}
        videoTitle={activeVideo?.title}
      />
    </section>
  );
}

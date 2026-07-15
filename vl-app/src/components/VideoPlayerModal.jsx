import { useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';

/**
 * Extracts YouTube Video ID from a standard, shared, or embed YouTube URL.
 */
export function getYouTubeId(url) {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Premium overlay Video Player Modal.
 * Plays YouTube videos directly inside an iframe on the page.
 */
export default function VideoPlayerModal({ isOpen, onClose, videoUrl, videoTitle }) {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !videoUrl) return null;

  const videoId = getYouTubeId(videoUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-slate-950 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-10 animate-fade-in">
        {/* Header / Title bar */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-slate-900/50">
          <h3 className="text-white font-semibold text-base truncate pr-6">
            {videoTitle || 'Watch Video'}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            aria-label="Close player"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="aspect-video w-full bg-black">
          {videoId ? (
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={videoTitle || 'YouTube video player'}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center gap-3">
              <p className="text-sm">Cannot play this video format directly on the page.</p>
              <a 
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs px-4 py-2"
              >
                Watch External Video
              </a>
            </div>
          )}
        </div>

        {/* Footer controls / YouTube option */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-white/10 bg-slate-900/50">
          <p className="text-slate-500 text-xs">
            Virtual Labs Video Player
          </p>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-semibold transition-colors border border-red-500/20 hover:border-red-500/40 bg-red-500/5 hover:bg-red-500/10 rounded-lg px-3.5 py-2"
          >
            Watch on YouTube
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

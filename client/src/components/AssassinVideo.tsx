import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface AssassinVideoProps {
  winnerTeam: "dark" | "light";
  winnerTeamName: string;
  loserTeamName: string;
  startX?: number;
  startY?: number;
  onComplete?: () => void;
}

export function AssassinVideo({ winnerTeam, winnerTeamName, loserTeamName, onComplete }: AssassinVideoProps) {
  const [show, setShow] = useState(true);
  const [showFlash, setShowFlash] = useState(false);
  const [showLoserText, setShowLoserText] = useState(false);
  const [showWinnerText, setShowWinnerText] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [fadeOutAll, setFadeOutAll] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const video = videoRef.current;
      video.currentTime = 0;
      
      // Try to play when ready
      const tryPlay = () => {
        if (video.readyState >= 4) { // HAVE_ENOUGH_DATA
          video.play().catch(err => {
            console.error('Assassin video play error:', err);
            // If video fails, still show winner
            handleVideoEnd();
          });
        } else {
          // Wait a bit and try again
          setTimeout(tryPlay, 100);
        }
      };
      
      tryPlay();
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, []);

  const handleVideoEnd = () => {
    // Flash effect
    setShowFlash(true);
    setTimeout(() => {
      setShowFlash(false);
      // Start closing animation and show loser text first
      setIsClosing(true);
      setShowLoserText(true);
      
      // After 1.5 seconds, hide loser text and show winner text
      setTimeout(() => {
        setShowLoserText(false);
        setShowWinnerText(true);
        
        // Fade out everything after 1.5 seconds - faster
        setTimeout(() => {
          setFadeOutAll(true);
          // Complete after fade out - much faster
          setTimeout(() => {
            onComplete?.();
          }, 300); // faster fade
        }, 1500); // reduced from 2000ms
      }, 1500); // reduced from 2000ms
    }, 300);
  };

  if (!show && !showLoserText && !showWinnerText) return null;

  return (
    <>
      {/* Flash effect overlay */}
      {showFlash && (
        <div 
          className="fixed inset-0 z-[150] pointer-events-none bg-white"
          style={{
            animation: 'flash 0.3s ease-out forwards'
          }}
        />
      )}
      
      {/* Dark overlay with radial fade - persists until everything fades */}
      {(show || showLoserText || showWinnerText) && (
        <div 
          className="fixed inset-0 z-[99] pointer-events-none"
          style={{
            background: fadeOutAll 
              ? 'radial-gradient(circle at center, transparent 0%, transparent 100%)'
              : 'radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 100%)',
            backdropFilter: 'blur(4px)',
            animation: fadeOutAll 
              ? 'radialFadeOut 0.4s ease-out forwards'
              : 'radialFadeIn 0.5s ease-in-out forwards',
          }}
        />
      )}
      
      {/* Video - FULLSCREEN NO FRAME */}
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
          <video
            ref={videoRef}
            src="/siyah kelime seçme yeni.mp4"
            autoPlay
            muted
            playsInline
            onEnded={handleVideoEnd}
            className="w-full h-full object-contain"
            style={{
              animation: isClosing 
                ? 'radialZoomOut 0.3s ease-in forwards'
                : 'radialZoomIn 0.8s ease-out forwards'
            }}
          />
        </div>
      )}
      
      {/* Loser text - who found the assassin */}
      {showLoserText && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
          style={{
            animation: fadeOutAll 
              ? 'fadeOut 0.3s ease-out forwards'
              : 'fadeIn 0.5s ease-in forwards'
          }}
        >
          <div className="text-center">
            <div 
              className="text-5xl md:text-7xl font-black mb-4"
              style={{
                color: winnerTeam === "dark" ? '#ef4444' : '#3b82f6',
                textShadow: winnerTeam === "dark" 
                  ? '0 0 60px rgba(239,68,68,0.9), 0 0 120px rgba(239,68,68,0.6)' 
                  : '0 0 60px rgba(59,130,246,0.9), 0 0 120px rgba(59,130,246,0.6)',
                animation: 'assassinPulse 1s ease-in-out infinite'
              }}
            >
              {loserTeamName}
            </div>
            <div 
              className="text-3xl md:text-5xl font-bold text-purple-400"
              style={{
                textShadow: '0 2px 20px rgba(147,51,234,0.8)',
                animation: 'fadeInUp 0.8s ease-out forwards 0.3s',
                opacity: 0
              }}
            >
              Siyah Kelimeyi Buldu!
            </div>
          </div>
        </div>
      )}
      
      {/* Winner text */}
      {showWinnerText && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none"
          style={{
            animation: fadeOutAll 
              ? 'fadeOut 0.3s ease-out forwards'
              : 'fadeIn 0.5s ease-in forwards'
          }}
        >
          <div className="text-center">
            <div 
              className="text-5xl md:text-7xl font-black mb-4"
              style={{
                color: winnerTeam === "dark" ? '#3b82f6' : '#ef4444',
                textShadow: winnerTeam === "dark" 
                  ? '0 0 60px rgba(59,130,246,0.9), 0 0 120px rgba(59,130,246,0.6)' 
                  : '0 0 60px rgba(239,68,68,0.9), 0 0 120px rgba(239,68,68,0.6)',
                animation: 'winnerPulse 1s ease-in-out infinite'
              }}
            >
              {winnerTeamName}
            </div>
            <div 
              className="text-3xl md:text-5xl font-bold text-white"
              style={{
                textShadow: '0 2px 20px rgba(255,255,255,0.5)',
                animation: 'fadeInUp 0.8s ease-out forwards 0.3s',
                opacity: 0
              }}
            >
              KAZANDI!
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes flash {
          0% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes radialFadeIn {
          from {
            background: radial-gradient(circle at center, transparent 70%, rgba(0,0,0,0.95) 100%);
          }
          to {
            background: radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 100%);
          }
        }
        
        @keyframes radialFadeOut {
          from {
            background: radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.95) 100%);
          }
          to {
            background: radial-gradient(circle at center, transparent 70%, transparent 100%);
          }
        }
        
        @keyframes radialZoomIn {
          from {
            transform: scale(0);
            opacity: 0;
            clip-path: circle(0% at center);
          }
          to {
            transform: scale(1);
            opacity: 1;
            clip-path: circle(100% at center);
          }
        }
        
        @keyframes radialZoomOut {
          from {
            transform: scale(1);
            opacity: 1;
            clip-path: circle(100% at center);
          }
          to {
            transform: scale(0);
            opacity: 0;
            clip-path: circle(0% at center);
          }
        }
        
        @keyframes winnerPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
        
        @keyframes assassinPulse {
          0%, 100% {
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            transform: scale(1.03);
            filter: brightness(1.2);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
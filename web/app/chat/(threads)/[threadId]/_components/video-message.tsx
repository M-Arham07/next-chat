"use client"

import { Play, Pause } from "lucide-react";
import { useRef, useState } from "react";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";

interface VideoMessageProps {
  msgId: string;
  videoUrl: string;
  status?: string;
}

const VideoMessage = ({ msgId, videoUrl, status }: VideoMessageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const progress = useChatAppStore(s => s.uploadingProgress?.[msgId] || 0);
  const displayUrl = videoUrl.startsWith("blob:") ? videoUrl.split("#")[0] : videoUrl;

  const togglePlay = () => {
    if (status === "sending") return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };


  return (
    <div className="p-1 relative group overflow-hidden rounded-xl bg-muted/20 border border-border/50">
      <video
        key={displayUrl}
        ref={videoRef}
        crossOrigin={videoUrl.startsWith("blob:") ? undefined : "anonymous"}
        className={`rounded-xl max-w-62.5 sm:max-w-75 aspect-video object-contain bg-black transition-opacity ${status === "sending" ? "opacity-30 grayscale" : ""}`}
        onLoadedData={() => setIsLoaded(true)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      >
        <source src={displayUrl} type="video/mp4" />
      </video>
      
      {status === "sending" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-sm">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <svg className="absolute w-full h-full -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-white/20"
              />
              <circle
                cx="24"
                cy="24"
                r="20"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={126}
                strokeDashoffset={126 - (126 * progress) / 100}
                className="text-primary transition-all duration-300"
              />
            </svg>
            <span className="text-[10px] font-bold text-white">{progress}%</span>
          </div>
          <span className="text-[10px] text-white/70 font-medium uppercase tracking-widest">
            {progress < 50 ? "Optimizing..." : "Uploading..."}
          </span>
        </div>
      ) : (
        <>
          {!isPlaying && isLoaded && (
            <div 
               className="absolute inset-0 flex items-center justify-center transition-opacity bg-black/20 cursor-pointer flex-col"
               onClick={togglePlay}
            >
               <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-white fill-white" />
               </div>
            </div>
          )}
          
          <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-black/40 text-white pointer-events-none text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
            Video
          </div>
        </>
      )}
    </div>
  );
};

export default VideoMessage;

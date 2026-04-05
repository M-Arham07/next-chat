"use client"

import { Play, Pause, Maximize2 } from "lucide-react";
import { useRef, useState } from "react";
import { useChatAppStore } from "@/features/chat/store/chatapp.store";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoMessageProps {
  msgId: string;
  videoUrl: string;
  status?: string;
}

const VideoMessage = ({ msgId, videoUrl, status }: VideoMessageProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [duration, setDuration] = useState(0);
  const progress = useChatAppStore(s => s.uploadingProgress?.[msgId] || 0);
  const displayUrl = videoUrl.startsWith("blob:") ? videoUrl.split("#")[0] : videoUrl;

  const formatDuration = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
    setIsLoaded(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <Dialog>
      <div className="p-1 relative group overflow-hidden rounded-xl bg-muted/20 border border-border/50 min-h-50 min-w-62.5 sm:min-w-75">
        {!isLoaded && <Skeleton className="absolute inset-1 rounded-xl z-0" />}

        <video
          key={displayUrl}
          ref={videoRef}
          crossOrigin={videoUrl.startsWith("blob:") ? undefined : "anonymous"}
          className={`relative z-10 rounded-xl max-w-62.5 sm:max-w-75 aspect-video object-contain bg-black transition-opacity ${status === "sending" ? "opacity-30 grayscale" : ""} ${!isLoaded ? "opacity-0" : "opacity-100"}`}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={handlePause}
          onEnded={() => setIsPlaying(false)}
          onClick={(e) => { e.stopPropagation(); togglePlay(); }}
          playsInline
          preload="metadata"
        >
          {/* Append #t=0.001 to force browser to stop downloading after getting the first frame */}
          <source src={displayUrl} type="video/mp4" />
        </video>

        {status === "sending" ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-2 bg-black/40 backdrop-blur-sm rounded-xl">
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
                className="absolute inset-0 z-20 flex items-center justify-center transition-opacity bg-black/20 cursor-pointer rounded-xl"
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              >
                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                </div>
              </div>
            )}

            {isLoaded && (
              <DialogTrigger asChild>
                <button
                  title="Open fullscreen player"
                  onClick={(e) => { e.stopPropagation(); handlePause(); }}
                  className="absolute bottom-3 right-3 p-2 z-30 rounded-md bg-black/60 hover:bg-black/80 text-white opacity-100 transition-opacity backdrop-blur-md border border-white/20 cursor-pointer"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </DialogTrigger>
            )}

            {isLoaded && (
              <div className="absolute bottom-3 left-3 px-1.5 py-0.5 rounded bg-black/40 text-white pointer-events-none z-30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
                {formatDuration(duration)}
              </div>
            )}

            <div className="absolute top-3 right-3 px-1.5 py-0.5 rounded bg-black/40 text-white pointer-events-none z-30 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/10">
              Video
            </div>
          </>
        )}
      </div>

      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black border-none shadow-2xl">
        <video
          src={displayUrl}
          controls
          autoPlay
          className="w-full max-h-[85vh] object-contain rounded-lg outline-none"
        />
      </DialogContent>
    </Dialog>
  );
};

export default VideoMessage;

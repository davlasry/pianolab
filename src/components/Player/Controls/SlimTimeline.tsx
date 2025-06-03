import { useRef } from "react";
import { useProgressPercent } from "@/TransportTicker/transportTicker";
import { cn } from "@/lib/utils";

interface SlimTimelineProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (time: number) => void;
  className?: string;
}

/**
 * A slim timeline component that shows playback progress and allows seeking
 * Designed to be placed above the player controls
 */
export function SlimTimeline({
  duration,
  currentTime,
  isPlaying,
  onSeek,
  className,
}: SlimTimelineProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const percentComplete = useProgressPercent(duration);

  // Handle click on timeline to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = clickX / rect.width;
    const newTime = clickPercent * duration;
    
    // Ensure time is within bounds
    const clampedTime = Math.max(0, Math.min(newTime, duration));
    onSeek(clampedTime);
  };

  return (
    <div 
      className={cn(
        "w-full h-1 bg-muted-foreground/20 cursor-pointer relative group",
        className
      )}
      ref={timelineRef}
      onClick={handleTimelineClick}
      role="slider"
      aria-label="Playback position"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentComplete * 100}
      tabIndex={0}
      onKeyDown={(e) => {
        // Allow keyboard navigation with left/right arrows
        if (e.key === "ArrowLeft") {
          onSeek(Math.max(0, currentTime - 5)); // 5 seconds back
          e.preventDefault();
        } else if (e.key === "ArrowRight") {
          onSeek(Math.min(duration, currentTime + 5)); // 5 seconds forward
          e.preventDefault();
        }
      }}
    >
      {/* Progress bar */}
      <div 
        className="absolute top-0 left-0 h-full bg-primary transition-all"
        style={{ width: `${percentComplete * 100}%` }}
      />
      
      {/* Playhead */}
      <div 
        className={cn(
          "absolute top-1/2 -translate-y-1/2 w-2 h-4 bg-primary rounded-full -ml-1 shadow-md",
          "opacity-0 group-hover:opacity-100",
          isPlaying && "opacity-100"
        )}
        style={{ left: `${percentComplete * 100}%` }}
      />
      
      {/* Hover effect - shows a slightly larger area for better UX */}
      <div className="absolute top-0 left-0 w-full h-3 -translate-y-1" />
    </div>
  );
}

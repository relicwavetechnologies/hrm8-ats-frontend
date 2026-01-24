import { Button } from '@/shared/components/ui/button';
import { Mic, MicOff, Video, VideoOff, Pause, Play, StopCircle } from 'lucide-react';
import { useState } from 'react';

interface InterviewControlsProps {
  onEndInterview: () => void;
  onTogglePause?: () => void;
  showVideoControls?: boolean;
  showAudioControls?: boolean;
  isPaused?: boolean;
}

export function InterviewControls({
  onEndInterview,
  onTogglePause,
  showVideoControls = false,
  showAudioControls = true,
  isPaused = false
}: InterviewControlsProps) {
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);

  return (
    <div className="flex items-center justify-center gap-3 p-4 bg-card border rounded-lg">
      {showAudioControls && (
        <Button
          variant={micEnabled ? 'default' : 'destructive'}
          size="icon"
          onClick={() => setMicEnabled(!micEnabled)}
          className="h-12 w-12 rounded-full"
        >
          {micEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>
      )}

      {showVideoControls && (
        <Button
          variant={videoEnabled ? 'default' : 'destructive'}
          size="icon"
          onClick={() => setVideoEnabled(!videoEnabled)}
          className="h-12 w-12 rounded-full"
        >
          {videoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>
      )}

      {onTogglePause && (
        <Button
          variant="outline"
          size="icon"
          onClick={onTogglePause}
          className="h-12 w-12 rounded-full"
        >
          {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </Button>
      )}

      <Button
        variant="destructive"
        size="icon"
        onClick={onEndInterview}
        className="h-12 w-12 rounded-full"
      >
        <StopCircle className="h-5 w-5" />
      </Button>
    </div>
  );
}

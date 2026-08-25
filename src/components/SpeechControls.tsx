import { Volume2, VolumeX, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useSpeech } from '@/hooks/useSpeech';

interface SpeechControlsProps {
  text?: string;
  compact?: boolean;
}

export default function SpeechControls({ text, compact = false }: SpeechControlsProps) {
  const { speak, stop, isSpeaking, rate, setRate, voices, selectedVoice, setSelectedVoice, supported } =
    useSpeech();

  if (!supported) return null;

  const englishVoices = voices.filter((v) => v.lang.startsWith('en'));

  const handleToggle = () => {
    if (isSpeaking) {
      stop();
    } else if (text) {
      speak(text);
    }
  };

  if (compact) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={handleToggle}
        aria-label={isSpeaking ? '停止朗读' : '朗读'}
      >
        {isSpeaking ? <VolumeX className="size-4 text-primary" /> : <Volume2 className="size-4" />}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap p-2 rounded-lg bg-muted/30">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        className="gap-1.5 h-8"
        disabled={!text}
      >
        {isSpeaking ? (
          <>
            <VolumeX className="size-3.5" />
            停止
          </>
        ) : (
          <>
            <Volume2 className="size-3.5" />
            朗读
          </>
        )}
      </Button>

      <div className="flex items-center gap-2 flex-1 min-w-[140px]">
        <Gauge className="size-3.5 text-muted-foreground shrink-0" />
        <Slider
          value={[rate]}
          onValueChange={(v) => setRate(v[0])}
          min={0.5}
          max={2}
          step={0.1}
          className="w-full"
          aria-label="语速"
        />
        <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">
          {rate.toFixed(1)}x
        </span>
      </div>

      {englishVoices.length > 0 && (
        <Select value={selectedVoice} onValueChange={setSelectedVoice}>
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue placeholder="选择声音" />
          </SelectTrigger>
          <SelectContent>
            {englishVoices.slice(0, 10).map((v) => (
              <SelectItem key={v.name} value={v.name} className="text-xs">
                {v.name} ({v.lang})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

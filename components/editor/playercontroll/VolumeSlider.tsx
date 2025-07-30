import type {PlayerRef} from '@remotion/player';
import React, {useEffect, useState} from 'react';
 
export const VolumeSlider: React.FC<{
  playerRef: React.RefObject<PlayerRef>;
}> = ({playerRef}) => {
  const [volume, setVolume] = useState(playerRef.current?.getVolume() ?? 1);
  const [muted, setMuted] = useState(playerRef.current?.isMuted() ?? false);
 
  useEffect(() => {
    const {current} = playerRef;
    if (!current) {
      return;
    }
 
    const onVolumeChange = () => {
      setVolume(current.getVolume());
    };
 
    const onMuteChange = () => {
      setMuted(current.isMuted());
    };
 
    current.addEventListener('volumechange', onVolumeChange);
    current.addEventListener('mutechange', onMuteChange);
 
    return () => {
      current.removeEventListener('volumechange', onVolumeChange);
      current.removeEventListener('mutechange', onMuteChange);
    };
  }, [playerRef]);
 
  const onChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback(
      (evt) => {
        if (!playerRef.current) {
          return;
        }
 
        const newVolume = Number(evt.target.value);
        if (newVolume > 0 && playerRef.current.isMuted()) {
          playerRef.current.unmute();
        }
 
        playerRef.current.setVolume(newVolume);
      },
      [playerRef],
    );
 
  return (
    <input
      value={muted ? 0 : volume}
      type="range"
      min={0}
      max={1}
      step={0.01}
      onChange={onChange}
    />
  );
};

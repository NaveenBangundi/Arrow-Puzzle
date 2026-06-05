import { useEffect, useRef } from 'react';
import { Audio } from 'expo-av';
import { useGame } from '../context/GameContext';

const ROTATE_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';
const WIN_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2019/2019-84.wav';
const CLICK_SOUND_URL = 'https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav';

export const useGameAudio = () => {
  const { soundEnabled } = useGame();
  const rotateSoundRef = useRef<Audio.Sound | null>(null);
  const winSoundRef = useRef<Audio.Sound | null>(null);
  const clickSoundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Enable audio in Expo
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      playThroughEarpieceAndroid: false,
    });

    // Preload sounds
    loadSounds();

    return () => {
      // Unload sounds on unmount
      rotateSoundRef.current?.unloadAsync();
      winSoundRef.current?.unloadAsync();
      clickSoundRef.current?.unloadAsync();
    };
  }, []);

  const loadSounds = async () => {
    try {
      const { sound: rotateSound } = await Audio.Sound.createAsync(
        { uri: ROTATE_SOUND_URL },
        { shouldPlay: false }
      );
      rotateSoundRef.current = rotateSound;

      const { sound: winSound } = await Audio.Sound.createAsync(
        { uri: WIN_SOUND_URL },
        { shouldPlay: false }
      );
      winSoundRef.current = winSound;

      const { sound: clickSound } = await Audio.Sound.createAsync(
        { uri: CLICK_SOUND_URL },
        { shouldPlay: false }
      );
      clickSoundRef.current = clickSound;
    } catch (error) {
      console.log('Audio preloading failed (possibly offline):', error);
    }
  };

  const playRotateSound = async () => {
    if (!soundEnabled) return;
    try {
      if (rotateSoundRef.current) {
        await rotateSoundRef.current.replayAsync();
      } else {
        // Fallback load and play
        const { sound } = await Audio.Sound.createAsync(
          { uri: ROTATE_SOUND_URL },
          { shouldPlay: true }
        );
        rotateSoundRef.current = sound;
      }
    } catch (e) {
      // Fail silently if offline or failed
    }
  };

  const playWinSound = async () => {
    if (!soundEnabled) return;
    try {
      if (winSoundRef.current) {
        await winSoundRef.current.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: WIN_SOUND_URL },
          { shouldPlay: true }
        );
        winSoundRef.current = sound;
      }
    } catch (e) {
      // Fail silently
    }
  };

  const playClickSound = async () => {
    if (!soundEnabled) return;
    try {
      if (clickSoundRef.current) {
        await clickSoundRef.current.replayAsync();
      } else {
        const { sound } = await Audio.Sound.createAsync(
          { uri: CLICK_SOUND_URL },
          { shouldPlay: true }
        );
        clickSoundRef.current = sound;
      }
    } catch (e) {
      // Fail silently
    }
  };

  return {
    playRotateSound,
    playWinSound,
    playClickSound,
  };
};

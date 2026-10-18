import confetti from 'canvas-confetti';

/**
 * Plays a cheerful reward chime using Web Audio API synthesis
 * No external audio files needed; works across all modern browsers.
 */
export const playStarCelebrationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Resume context if suspended by browser autoplay policy
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Melodic fanfare notes: C5, E5, G5, C6, E6
    const notes = [
      { freq: 523.25, time: 0.0, duration: 0.18 }, // C5
      { freq: 659.25, time: 0.12, duration: 0.18 }, // E5
      { freq: 783.99, time: 0.24, duration: 0.22 }, // G5
      { freq: 1046.50, time: 0.38, duration: 0.45 }, // C6
      { freq: 1318.51, time: 0.52, duration: 0.65 }, // E6
    ];

    notes.forEach(({ freq, time, duration }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle'; // Sweet chime-like timbre
      osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

      // Smooth attack and decay envelope
      gain.gain.setValueAtTime(0.001, ctx.currentTime + time);
      gain.gain.exponentialRampToValueAtTime(0.22, ctx.currentTime + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + time);
      osc.stop(ctx.currentTime + time + duration);
    });
  } catch (e) {
    console.debug('Audio play failed silently', e);
  }
};

/**
 * Triggers a magnificent cascading Star Shower (mưa sao rơi) across the viewport.
 * Uses canvas-confetti with star shapes, golden/amber tones, and multi-wave cascading effect.
 */
export const triggerStarShower = () => {
  // 1. Play sound
  playStarCelebrationSound();

  const starColors = ['#FFD700', '#FBBF24', '#F59E0B', '#FFA751', '#FFE259', '#38BDF8', '#34D399', '#FB7185'];

  // Wave 1: Immediate celebratory cannons from bottom-left and bottom-right
  confetti({
    particleCount: 40,
    angle: 60,
    spread: 65,
    origin: { x: 0.05, y: 0.8 },
    shapes: ['star'],
    colors: starColors,
    scalar: 1.3,
    ticks: 250,
  });

  confetti({
    particleCount: 40,
    angle: 120,
    spread: 65,
    origin: { x: 0.95, y: 0.8 },
    shapes: ['star'],
    colors: starColors,
    scalar: 1.3,
    ticks: 250,
  });

  // Wave 2: Cascading star shower raining down from top of the screen for 3.5 seconds
  const showerDuration = 3500;
  const animationEnd = Date.now() + showerDuration;

  const intervalId = window.setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      clearInterval(intervalId);
      return;
    }

    // Shower stream from above (y: -0.1 to 0) drifting downwards
    confetti({
      particleCount: 6,
      angle: 90,
      spread: 160,
      origin: { x: Math.random(), y: -0.05 },
      gravity: 0.75,
      drift: (Math.random() - 0.5) * 0.6,
      shapes: ['star'],
      colors: starColors,
      scalar: Math.random() * 0.8 + 0.9, // 0.9 to 1.7 scale
      ticks: 280,
    });
  }, 120);

  // Wave 3: Grand climax burst right in the center at 1.2s
  setTimeout(() => {
    confetti({
      particleCount: 70,
      spread: 100,
      origin: { x: 0.5, y: 0.4 },
      shapes: ['star'],
      colors: ['#FFD700', '#FFE259', '#FBBF24', '#F59E0B', '#FFF'],
      scalar: 1.5,
      ticks: 300,
    });
  }, 1200);
};

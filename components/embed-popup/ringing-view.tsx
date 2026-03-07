'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import type { AgentState } from '@livekit/components-react';

interface RingingViewProps {
  avatarSrc: string;
  agentName?: string;
  isRinging: boolean;
  agentState?: AgentState;
}

export function RingingView({
  avatarSrc,
  agentName = 'AI Receptionist',
  isRinging,
  agentState,
}: RingingViewProps) {
  const [dotCount, setDotCount] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate "Calling..." dots — only while ringing
  useEffect(() => {
    if (!isRinging) return;
    const interval = setInterval(() => {
      setDotCount((prev) => (prev >= 3 ? 0 : prev + 1));
    }, 500);
    return () => clearInterval(interval);
  }, [isRinging]);

  // Phone ringtone via Web Audio API — only while ringing
  useEffect(() => {
    if (!isRinging) return;

    const playRing = () => {
      try {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioContext();
        }
        const ctx = audioCtxRef.current;

        const playBurst = (startTime: number) => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.frequency.value = 480;
          osc2.frequency.value = 440;
          osc1.type = 'sine';
          osc2.type = 'sine';

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
          gain.gain.setValueAtTime(0.25, startTime + 0.38);
          gain.gain.linearRampToValueAtTime(0, startTime + 0.4);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(startTime);
          osc1.stop(startTime + 0.4);
          osc2.start(startTime);
          osc2.stop(startTime + 0.4);
        };

        const now = ctx.currentTime;
        playBurst(now);
        playBurst(now + 0.5);
      } catch {
        // Web Audio API not available — silently skip
      }
    };

    const startDelay = setTimeout(() => {
      playRing();
      ringIntervalRef.current = setInterval(playRing, 3000);
    }, 300);

    return () => {
      clearTimeout(startDelay);
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
    };
  }, [isRinging]);

  const dots = '.'.repeat(dotCount);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 z-10 flex flex-col items-center overflow-hidden rounded-[28px]"
      style={{
        background: 'linear-gradient(180deg, #1a1f3c 0%, #0f1220 50%, #0a0d1a 100%)',
      }}
    >
      {isRinging ? (
        /* ── RINGING STATE ── */
        <>
          {/* "Calling..." header */}
          <div className="mt-12 text-center">
            <p className="text-base font-light tracking-[0.25em] text-white/80 uppercase">
              Calling{dots}
            </p>
          </div>

          {/* Avatar with pulsing rings */}
          <div className="flex flex-1 flex-col items-center justify-center">
            <div className="relative flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-white/20"
                  animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
                  style={{ width: 108, height: 108 }}
                />
              ))}
              <div className="relative z-10 h-36 w-36 overflow-hidden rounded-full border-2 border-white/30 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarSrc} alt="Agent" className="h-full w-full object-cover object-top" />
              </div>
            </div>

            {/* Name + "Ringing..." */}
            <div className="mt-8 text-center">
              <h2 className="text-xl font-semibold text-white">{agentName}</h2>
              <p className="mt-1 text-sm text-white/50">Ringing...</p>
            </div>
          </div>
        </>
      ) : (
        /* ── ACTIVE CALL STATE (agent speaking, no video) ── */
        <div className="flex flex-1 flex-col items-center justify-center">
          {/* Avatar with pulsing rings (kept from ringing state) */}
          <div className="relative flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute rounded-full border border-white/20"
                animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.7, ease: 'easeOut' }}
                style={{ width: 108, height: 108 }}
              />
            ))}
            <div className="relative z-10 h-36 w-36 overflow-hidden rounded-full border-2 border-white/30 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={avatarSrc} alt="Agent" className="h-full w-full object-cover object-top" />
            </div>
          </div>

          {/* Name — close to avatar */}
          <h2 className="mt-4 text-xl font-semibold text-white">{agentName}</h2>

          {/* Audio bars — animate based on agent state */}
          {agentState && (
            <div className="mt-3 flex h-8 items-center justify-center gap-1.5">
              {([0.6, 1, 0.8, 1, 0.6] as number[]).map((amp, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 rounded-full bg-white/50"
                  animate={
                    agentState === 'speaking'
                      ? { height: [6, 6 + amp * 22, 6], backgroundColor: ['rgba(255,255,255,0.5)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0.5)'] }
                      : agentState === 'thinking'
                      ? { height: [6, 6 + amp * 8, 6], backgroundColor: 'rgba(255,255,255,0.5)' }
                      : { height: 6, backgroundColor: 'rgba(255,255,255,0.3)' }
                  }
                  transition={
                    agentState === 'speaking' || agentState === 'thinking'
                      ? { duration: 0.55, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }
                      : { duration: 0.3 }
                  }
                  style={{ minHeight: 6 }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

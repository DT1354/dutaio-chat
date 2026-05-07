"use client";

import { useState, useRef, useEffect } from "react";

export default function MusicPlayer() {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const triedAutoPlay = useRef(false);

  // 设置音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = 0.3;
    }
  }, []);

  // 用户首次交互时自动播放（绕过浏览器限制）
  useEffect(() => {
    if (triedAutoPlay.current) return;
    triedAutoPlay.current = true;

    const tryPlay = () => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.play().then(() => {
        setPlaying(true);
      }).catch(() => {
        // 浏览器仍然阻止，保持暂停状态
      });
      // 只触发一次
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("scroll", tryPlay);
    };

    document.addEventListener("click", tryPlay, { once: false });
    document.addEventListener("touchstart", tryPlay, { once: false });
    document.addEventListener("scroll", tryPlay, { once: true, passive: true });
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  return (
    <>
      <audio ref={audioRef} src="/assets/audio/bgm.mp3" loop preload="auto" />
      <button
        onClick={toggle}
        aria-label={playing ? "暂停音乐" : "播放音乐"}
        style={{
          position: "fixed",
          bottom: 28,
          left: 28,
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: playing ? "rgba(201,169,110,0.15)" : "transparent",
          border: `1.5px solid ${playing ? "var(--accent)" : "var(--border)"}`,
          color: playing ? "var(--accent)" : "var(--text-muted)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          transition: "all 0.3s ease",
          padding: 0,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            animation: playing ? "musicPulse 1.2s ease-in-out infinite" : "none",
          }}
        >
          {playing ? (
            <>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </>
          ) : (
            <>
              <path d="M9 18V5l12-2v13" opacity="0.4" />
              <circle cx="6" cy="18" r="3" opacity="0.4" />
              <circle cx="18" cy="16" r="3" opacity="0.4" />
              <line x1="3" y1="3" x2="21" y2="21" strokeWidth="1.5" />
            </>
          )}
        </svg>
      </button>
    </>
  );
}

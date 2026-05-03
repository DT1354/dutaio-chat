"use client";

import { useEffect, useRef, useState } from "react";

// 打字机效果 hook
export function useTypewriter(text: string, speed = 80, delay = 0) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplay("");
    setDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplay(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [text, speed, delay]);

  return { display, done };
}

// 文字逐字揭示动画组件
export function TextReveal({ text, tag = "div", className = "", delay = 0 }: {
  text: string; tag?: "h1" | "h2" | "h3" | "p" | "div" | "span"; className?: string; delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const Tag = tag as any;

  return (
    <Tag ref={ref} className={className} style={{ display: "inline-block", overflow: "hidden" }}>
      {text.split("").map((char, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(100%)",
            transition: `opacity 0.5s ease ${delay + i * 40}ms, transform 0.5s ease ${delay + i * 40}ms`,
            whiteSpace: char === " " ? "pre" : "normal",
          }}
        >
          {char}
        </span>
      ))}
    </Tag>
  );
}

// 数字滚动计数
export function CountUp({ value, suffix = "", duration = 2000, delay = 0 }: {
  value: string; suffix?: string; duration?: number; delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(false);

  // 提取数字部分
  const numMatch = value.match(/(\d+)/);
  const numStr = numMatch ? numMatch[1] : "0";
  const prefix = value.slice(0, numMatch?.index ?? 0);
  const num = parseInt(numStr);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setStarted(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!started) return;
    const timeout = setTimeout(() => {
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setCurrent(Math.round(eased * num));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, delay);
    return () => clearTimeout(timeout);
  }, [started, num, duration, delay]);

  return <span ref={ref}>{prefix}{current}{suffix}</span>;
}

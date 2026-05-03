"use client";

import { useEffect, useState } from "react";

// 自定义光标 + 磁吸按钮效果
export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovering, setHovering] = useState(false);
  const [clicking, setClicking] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 移动端不显示
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };
    const down = () => setClicking(true);
    const up = () => setClicking(false);
    const leave = () => setVisible(false);
    const enter = () => setVisible(true);

    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    document.addEventListener("mouseleave", leave);
    document.addEventListener("mouseenter", enter);

    // 检测可交互元素 hover
    const overHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest("a, button, [data-cursor-hover], .gallery-item, .contact-card, .project-card, .skill-card, .app-item, .kb-item")) {
        setHovering(true);
      } else {
        setHovering(false);
      }
    };
    window.addEventListener("mouseover", overHandler);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      document.removeEventListener("mouseleave", leave);
      document.removeEventListener("mouseenter", enter);
      window.removeEventListener("mouseover", overHandler);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: clicking ? 8 : hovering ? 48 : 12,
          height: clicking ? 8 : hovering ? 48 : 12,
          borderRadius: "50%",
          background: clicking ? "var(--accent)" : hovering ? "rgba(201,169,110,0.15)" : "rgba(201,169,110,0.6)",
          border: hovering ? "1.5px solid var(--accent)" : "none",
          pointerEvents: "none",
          zIndex: 99999,
          transform: `translate(${pos.x - (clicking ? 4 : hovering ? 24 : 6)}px, ${pos.y - (clicking ? 4 : hovering ? 24 : 6)}px)`,
          transition: "width 0.3s ease, height 0.3s ease, background 0.3s ease, transform 0.05s linear",
          mixBlendMode: hovering ? "normal" : "exclusion",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "var(--accent)",
          pointerEvents: "none",
          zIndex: 99999,
          transform: `translate(${pos.x - 2}px, ${pos.y - 2}px)`,
          transition: "transform 0.01s linear",
        }}
      />
    </>
  );
}

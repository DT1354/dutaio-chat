"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  profile, stats, skills, projects, articles, videos, contact,
  allArtworks, appScreens, personalPhotos, knowledgeBaseScreens,
  chatgptArtworks, productArtworks,
} from "@/data/site-data";
import ChatWidget from "@/components/ChatWidget";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";
import { TextReveal, CountUp, useTypewriter } from "@/components/Animations";

// 滚动渐显 hook
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// 视差图片组件
function ParallaxImg({ src, alt, speed = 0.08, style, onClick }: {
  src: string; alt: string; speed?: number; style?: React.CSSProperties; onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        const img = el.querySelector("img");
        if (img) img.style.transform = `translateY(${center * speed}px)`;
        rafRef.current = 0;
      });
    };
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => {
      window.removeEventListener("scroll", handler);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed]);

  return (
    <div ref={ref} style={{ overflow: "hidden", ...style }} onClick={onClick}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        style={{
          width: "100%",
          height: "120%",
          objectFit: "cover",
          willChange: "transform",
        }}
      />
    </div>
  );
}

// 3D 倾斜卡片
function TiltCard({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768);
  }, []);

  const handleMove = (e: React.MouseEvent) => {
    if (isMobile) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale(1.02)`;
  };

  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0) rotateX(0) scale(1)";
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ transition: "transform 0.3s ease", ...style }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

// 横向滚动画廊
function HorizontalGallery({ items, aspectRatio = "1/1", onImageClick, autoPlay = false }: {
  items: string[]; aspectRatio?: string; onImageClick?: (src: string) => void; autoPlay?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(!autoPlay);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollStart, setScrollStart] = useState(0);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 10);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  // 自动流动（marquee 效果）
  useEffect(() => {
    if (!autoPlay) return;
    const el = scrollRef.current;
    if (!el) return;
    let paused = false;
    let rafId: number;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("touchstart", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchend", onLeave);
    const animate = () => {
      if (!paused) {
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        } else {
          el.scrollLeft += 1.5;
        }
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("touchstart", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchend", onLeave);
    };
  }, [autoPlay]);

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (el) el.scrollBy({ left: dir * 320, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 左箭头（非自动播放时显示） */}
      {!autoPlay && canLeft && (
        <button
          onClick={() => scrollBy(-1)}
          style={{
            position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)",
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            color: "var(--accent)", fontSize: 18, zIndex: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--shadow)",
            transition: "opacity 0.3s",
          }}
        >‹</button>
      )}
      {/* 右箭头（非自动播放时显示） */}
      {!autoPlay && canRight && (
        <button
          onClick={() => scrollBy(1)}
          style={{
            position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)",
            width: 40, height: 40, borderRadius: "50%",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            color: "var(--accent)", fontSize: 18, zIndex: 10, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "var(--shadow)",
            transition: "opacity 0.3s",
          }}
        >›</button>
      )}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          gap: 16,
          overflowX: "auto",
          scrollSnapType: autoPlay ? "none" : "x proximity",
          paddingBottom: 12,
          paddingLeft: 4,
          paddingRight: 4,
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          userSelect: "none",
        }}
        onMouseDown={(e) => {
          const el = scrollRef.current;
          if (!el) return;
          setIsDragging(true);
          setStartX(e.pageX);
          setScrollStart(el.scrollLeft);
        }}
        onMouseMove={(e) => {
          if (!isDragging) return;
          const el = scrollRef.current;
          if (!el) return;
          const walk = (e.pageX - startX) * 1.5;
          el.scrollLeft = scrollStart - walk;
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {items.map((src, i) => (
          <div
            key={i}
            className="gallery-card"
            style={{
              flex: "0 0 auto",
              width: 280,
              scrollSnapAlign: "start",
              borderRadius: 12,
              overflow: "hidden",
              cursor: onImageClick ? "zoom-in" : "default",
            }}
            onClick={() => onImageClick?.(src)}
          >
            <ParallaxImg
              src={src}
              alt={`作品 ${i + 1}`}
              speed={0.08}
              style={{ aspectRatio, borderRadius: 12 }}
            />
          </div>
        ))}
      </div>
      {/* 滑动提示条 */}
      <div style={{
        marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        color: "var(--text-muted)", fontSize: 12,
      }}>
        <span style={{ opacity: 0.5 }}>←</span>
        <div style={{
          width: 80, height: 3, borderRadius: 2, background: "var(--border)",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: 0, left: 0, height: "100%", width: "30%",
            background: "var(--accent)", borderRadius: 2,
            animation: "slideHint 2s ease-in-out infinite",
          }} />
        </div>
        <span style={{ opacity: 0.5 }}>→</span>
        <span style={{ marginLeft: 4 }}>左右滑动浏览</span>
      </div>
    </div>
  );
}

// Marquee 跑马灯
function Marquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  return (
    <div style={{ overflow: "hidden", whiteSpace: "nowrap", margin: "32px 0" }}>
      <div style={{
        display: "inline-flex",
        animation: `marquee ${speed}s linear infinite`,
      }}>
        {[...items, ...items].map((item, i) => (
          <span key={i} style={{
            display: "inline-flex",
            alignItems: "center",
            margin: "0 24px",
            fontSize: 15,
            color: "var(--accent)",
            fontWeight: 600,
            letterSpacing: "0.05em",
          }}>
            <span style={{ margin: "0 16px", opacity: 0.3 }}>◆</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// 滚动进度条
function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handler = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      height: 2,
      width: `${progress}%`,
      background: "var(--accent)",
      zIndex: 99998,
      transition: "width 0.1s linear",
    }} />
  );
}

// 回到顶部
function BackToTop() {
  const [show, setShow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handler = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  if (!show) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        bottom: isMobile ? 76 : 80,
        right: isMobile ? 16 : 24,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        color: "var(--accent)",
        fontSize: 16,
        cursor: "pointer",
        zIndex: 9990,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "opacity 0.3s, transform 0.3s",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(10px)",
      }}
      aria-label="回到顶部"
    >
      ↑
    </button>
  );
}

// Hero 打字机
function HeroTypewriter() {
  const { display: bioDisplay, done: bioDone } = useTypewriter(profile.bio, 60, 800);
  const { display: tagDisplay } = useTypewriter(profile.tagline, 50, bioDone ? 0 : 99999);

  return (
    <div className="hero-content">
      <p className="hero-overline">你好，我是</p>
      <h1 className="hero-name">{profile.name}</h1>
      <p className="hero-bio" style={{ minHeight: 28 }}>{bioDisplay}<span style={{ opacity: bioDone ? 0 : 1, animation: "blink 0.8s infinite" }}>|</span></p>
      <p className="hero-tagline" style={{ minHeight: 28 }}>&ldquo;{tagDisplay}&rdquo;</p>
      <a href="#works" className="hero-cta">探索我的作品</a>
    </div>
  );
}

export default function Home() {
  const [zoom, setZoom] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1400);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener("scroll", onScroll); };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // 统计数字解析
  const parseStat = (val: string) => {
    const m = val.match(/(\d+)/);
    return { num: m ? parseInt(m[1]) : 0, prefix: val.slice(0, m?.index ?? 0), suffix: val.slice((m?.index ?? 0) + (m ? m[1].length : 0)) };
  };

  // 横向滚动 CSS + 手机适配
  useEffect(() => {
    const style = document.createElement("style");
    const isMobile = window.innerWidth <= 768;
    style.textContent = `
      .horizontal-gallery::-webkit-scrollbar { display: none; }
      @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
      @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
      @keyframes slideHint { 0%,100% { left: 0; } 50% { left: 70%; } }
      ${!isMobile ? '@media (pointer: fine) { * { cursor: none !important; } }' : ''}
      @media (max-width: 768px) {
        .gallery-card { width: 200px !important; }
        .scroll-hint { font-size: 11px !important; }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <>
      <SmoothScroll>
        <CustomCursor />
        <ScrollProgress />
        <BackToTop />

        {/* 加载动画 */}
        <div className={`page-loader${loaded ? " loaded" : ""}`}>
          <div className="loader-logo">DANDELION</div>
          <div className="loader-bar"><div className="loader-bar-inner" /></div>
        </div>

        <div className="page-content">
          {/* 导航 */}
          <nav className={`nav${scrolled ? " scrolled" : ""}`}>
            <span className="nav-logo">DANDELION</span>
            <div className="nav-links">
              <a href="#works">作品</a>
              <a href="#skills">技能</a>
              <a href="#projects">项目</a>
              <a href="#about">关于</a>
              <a href="#contact">联系</a>
              <button className="nav-chat-btn" onClick={() => document.querySelector<HTMLElement>('.chat-launcher-wrapper button')?.click()}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                聊天
              </button>
            </div>
            <button className="nav-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="菜单">
              <span /><span /><span />
            </button>
          </nav>

          {/* 手机菜单 */}
          <div className={`mobile-menu${menuOpen ? " open" : ""}`}>
            <a href="#works" onClick={closeMenu}>作品</a>
            <a href="#skills" onClick={closeMenu}>技能</a>
            <a href="#projects" onClick={closeMenu}>项目</a>
            <a href="#about" onClick={closeMenu}>关于</a>
            <a href="#contact" onClick={closeMenu}>联系</a>
            <button className="mobile-menu-chat" onClick={() => { closeMenu(); document.querySelector<HTMLElement>('.chat-launcher-wrapper button')?.click(); }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              聊天
            </button>
          </div>
          {menuOpen && <div className="mobile-backdrop" onClick={closeMenu} />}

          {/* Hero + 打字机 */}
          <section className="hero" id="hero">
            <video className="hero-bg" src="/assets/bg-ink.mp4" autoPlay loop muted playsInline />
            <div className="hero-overlay" />
            <HeroTypewriter />
          </section>

          {/* Stats + 数字滚动 */}
          <Reveal>
            <div className="stats-bar">
              {stats.map((s) => {
                const { num, prefix, suffix } = parseStat(s.value);
                return (
                  <div key={s.label} className="stat-item">
                    <div className="stat-value">
                      <CountUp value={s.value} />
                    </div>
                    <div className="stat-label">{s.label}</div>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* 技能 Marquee */}
          <Marquee items={skills.flatMap(s => s.items)} speed={25} />

          {/* AI摄影 - 横向滚动画廊 */}
          <section className="section" id="works">
            <Reveal>
              <p className="section-label">Selected Works</p>
              <TextReveal text="AI摄影 & 视觉创作" tag="h2" className="section-title" />
              <p className="section-desc" style={{ marginBottom: 32 }}>精通光效·焦距·构图·色彩四大体系，190+张AI摄影作品</p>
            </Reveal>
            <HorizontalGallery items={allArtworks} aspectRatio="1/1" onImageClick={setZoom} autoPlay />
          </section>

          <hr className="divider" />

          {/* 海报设计 - 横向滚动 */}
          <section className="section">
            <Reveal>
              <p className="section-label">Poster Design</p>
              <TextReveal text="海报设计" tag="h2" className="section-title" />
              <p className="section-desc" style={{ marginBottom: 32 }}>概念海报 · 视觉叙事 · 排版设计</p>
            </Reveal>
            <HorizontalGallery items={chatgptArtworks} aspectRatio="3/4" onImageClick={setZoom} />
          </section>

          <hr className="divider" />

          {/* AI视频 */}
          <section className="section">
            <Reveal>
              <p className="section-label">Video Works</p>
              <TextReveal text="AI视频创作" tag="h2" className="section-title" />
              <p className="section-desc" style={{ marginBottom: 32 }}>概念设定→AI出图→动态生成→剪辑调色</p>
            </Reveal>
            <div className="video-grid">
              {videos.map((v) => (
                <Reveal key={v.title}>
                  <TiltCard>
                    <div className="video-card">
                      <video src={v.src} controls playsInline loop muted preload="metadata" />
                      <div className="video-card-title">{v.title}</div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </section>

          <hr className="divider" />

          {/* 海报与文创 - 横向滚动 */}
          <section className="section">
            <Reveal>
              <p className="section-label">Product Design</p>
              <TextReveal text="海报与文创设计" tag="h2" className="section-title" />
              <p className="section-desc" style={{ marginBottom: 32 }}>蜜雪冰城中文排版、国风文创、产品摄影</p>
            </Reveal>
            <HorizontalGallery items={productArtworks} aspectRatio="1/1" onImageClick={setZoom} />
          </section>

          <hr className="divider" />

          {/* APP */}
          <section className="section">
            <Reveal>
              <p className="section-label">Personal Project</p>
              <TextReveal text="Dandelion APP" tag="h2" className="section-title" />
              <p className="section-desc">番茄钟·白噪音·习惯记录·便签·热力图·心情签</p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "8px 0 32px" }}>React + Supabase</p>
            </Reveal>
            <div className="app-grid">
              {appScreens.map((src, i) => (
                <div key={i} className="app-item" onClick={() => setZoom(src)}>
                  <ParallaxImg src={src} alt={`APP ${i + 1}`} speed={0.1} style={{ borderRadius: 12 }} />
                </div>
              ))}
            </div>
          </section>

          <hr className="divider" />

          {/* 技能 */}
          <section className="section" id="skills">
            <Reveal>
              <p className="section-label">Capabilities</p>
              <TextReveal text="核心技能" tag="h2" className="section-title" />
            </Reveal>
            <div className="skills-grid" style={{ marginTop: 32 }}>
              {skills.map((s, i) => (
                <Reveal key={s.category} delay={i * 80}>
                  <TiltCard>
                    <div className="skill-card">
                      <div className="skill-card-title">{s.category}</div>
                      <div className="skill-card-items">
                        {s.items.map((item) => (<span key={item} className="skill-tag">{item}</span>))}
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </section>

          <hr className="divider" />

          {/* 项目 - 时间线 */}
          <section className="section" id="projects">
            <Reveal>
              <p className="section-label">Experience</p>
              <TextReveal text="项目经验" tag="h2" className="section-title" />
            </Reveal>
            <div style={{ marginTop: 32, position: "relative", paddingLeft: 32 }}>
              <div style={{
                position: "absolute", left: 8, top: 0, bottom: 0, width: 2,
                background: "linear-gradient(to bottom, var(--accent), transparent)",
              }} />
              {projects.map((p, i) => (
                <Reveal key={p.title} delay={i * 80}>
                  <div style={{ position: "relative", marginBottom: 40 }}>
                    <div style={{
                      position: "absolute", left: -28, top: 8, width: 12, height: 12,
                      borderRadius: "50%", background: "var(--accent)",
                      boxShadow: "0 0 12px rgba(201,169,110,0.4)",
                    }} />
                    <TiltCard>
                      <div className="project-card">
                        <div className="project-period">{p.period}</div>
                        <h3 className="project-title">{p.title}</h3>
                        <p className="project-desc">{p.description}</p>
                        <div className="project-tech">{p.tech.map((t) => (<span key={t}>{t}</span>))}</div>
                      </div>
                    </TiltCard>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          <hr className="divider" />

          {/* 公众号 */}
          <section className="section">
            <Reveal>
              <p className="section-label">Content Creation</p>
              <TextReveal text="公众号 & 知识库" tag="h2" className="section-title" />
              <p className="section-desc">公众号 {contact.wechatPublic}（600+粉丝）· 小红书 {contact.xiaohongshu}（422粉丝）</p>
              <p className="section-desc" style={{ marginBottom: 32 }}>15万字AI知识库 + 12万字笔记</p>
            </Reveal>
            <Reveal delay={100}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--accent)" }}>爆款文章</h3>
              <div className="articles-list" style={{ marginBottom: 40 }}>
                {articles.map((a, i) => (
                  <div key={i} className="article-item">
                    <span style={{ color: "var(--accent)", marginRight: 8, fontWeight: 700 }}>{String(i + 1).padStart(2, "0")}</span>
                    {a}
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "var(--accent)" }}>知识库一览</h3>
              <div className="kb-grid">
                {knowledgeBaseScreens.map((src, i) => (
                  <div key={i} className="kb-item" onClick={() => setZoom(src)}>
                    <ParallaxImg src={src} alt={`知识库 ${i + 1}`} speed={0.1} style={{ borderRadius: 12 }} />
                  </div>
                ))}
              </div>
            </Reveal>
          </section>

          <hr className="divider" />

          {/* 关于 */}
          <section className="section" id="about">
            <Reveal>
              <p className="section-label">About</p>
              <TextReveal text="关于我" tag="h2" className="section-title" />
            </Reveal>
            <div className="about-content" style={{ marginTop: 32 }}>
              <Reveal>
                <div className="about-photo">
                  <ParallaxImg
                    src={personalPhotos[0]}
                    alt="杜涛"
                    speed={0.08}
                    style={{ borderRadius: 16, cursor: "zoom-in" }}
                    onClick={() => setZoom(personalPhotos[0])}
                  />
                </div>
              </Reveal>
              <Reveal delay={150}>
                <div>
                  <p className="about-quote">&ldquo;相机给了你黑色的画布，摄影让你涂抹光明&rdquo;</p>
                  <p className="about-story">{`我是杜涛，来自贵州，在重庆读书。西南大学园艺专业大二在读，国家励志奖学金获得者。

从高中不敢举手到大学主动竞选班长。从焦虑迷茫到建立15万字知识库。

阿德勒心理学深度实践者，元认知训练让我学会第三视角观察。
日更朋友圈1000+篇，记录每天的思考。

喜欢摄影、跑步、猫咪和一切可爱的事物。梦想成为数字游民。`}</p>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {["INFP", "园艺", "AI Art", "提示词工程", "逆向工程", "Vibe Coding", "摄影", "跑步", "猫咪"].map((tag) => (
                      <span key={tag} className="skill-tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>

          <hr className="divider" />

          {/* 联系 */}
          <section className="section" id="contact">
            <Reveal>
              <p className="section-label">Get in Touch</p>
              <TextReveal text="联系我" tag="h2" className="section-title" />
              <p className="section-desc" style={{ marginBottom: 32 }}>如果你对我的作品感兴趣，欢迎联系</p>
            </Reveal>
            <div className="contact-grid">
              <Reveal delay={0}><TiltCard><a className="contact-card" href={`mailto:${contact.email}`}><div className="contact-label">Email</div><div className="contact-value">{contact.email}</div></a></TiltCard></Reveal>
              <Reveal delay={60}><TiltCard><a className="contact-card" href={`tel:${contact.phone}`}><div className="contact-label">电话</div><div className="contact-value">{contact.phone}</div></a></TiltCard></Reveal>
              <Reveal delay={120}><TiltCard><div className="contact-card"><div className="contact-label">微信</div><div className="contact-value">{contact.wechat}</div></div></TiltCard></Reveal>
              <Reveal delay={180}><TiltCard><div className="contact-card"><div className="contact-label">QQ</div><div className="contact-value">{contact.qq}</div></div></TiltCard></Reveal>
              <Reveal delay={240}><TiltCard><div className="contact-card"><div className="contact-label">公众号</div><div className="contact-value">{contact.wechatPublic}</div></div></TiltCard></Reveal>
              <Reveal delay={300}><TiltCard><div className="contact-card"><div className="contact-label">小红书</div><div className="contact-value">{contact.xiaohongshu}</div></div></TiltCard></Reveal>
            </div>
          </section>

          <footer className="footer">
            <div className="footer-logo">DANDELION · {profile.name}</div>
            <div className="footer-copy">© 2026 {profile.name} · {profile.location}</div>
          </footer>

          {zoom && (
            <div className="zoom-overlay" onClick={() => setZoom(null)}>
              <button className="zoom-close" onClick={() => setZoom(null)}>×</button>
              <img src={zoom} alt="放大查看" onClick={(e) => e.stopPropagation()} />
            </div>
          )}
        </div>

        {/* 聊天组件 */}
        <ChatWidget />
      </SmoothScroll>
    </>
  );
}

"use client";

import { useState, useEffect } from "react";

// 全局缓存，避免多个组件重复请求
let globalLikes: Record<string, number> = {};
let globalLoaded = false;
const listeners = new Set<() => void>();

async function fetchLikes() {
  try {
    const res = await fetch("/api/likes");
    if (res.ok) {
      globalLikes = await res.json();
      globalLoaded = true;
      listeners.forEach((fn) => fn());
    }
  } catch {}
}

export function LikesProvider() {
  useEffect(() => {
    if (!globalLoaded) fetchLikes();
  }, []);
  return null;
}

export function useLikes() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);
  return globalLikes;
}

export function LikeButton({ itemId }: { itemId: string }) {
  const [loading, setLoading] = useState(false);
  const [localLiked, setLocalLiked] = useState(false);
  const likes = useLikes();
  const count = likes[itemId] || 0;

  // 检查本地是否已点赞
  useEffect(() => {
    if (typeof window === "undefined") return;
    const key = `liked_${itemId}`;
    const stored = localStorage.getItem(key);
    if (stored) setLocalLiked(true);
  }, [itemId]);

  const handleLike = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // 已赞 → 取消
      if (localLiked) {
        const res = await fetch("/api/likes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ item_id: itemId, action: "unlike" }),
        });
        const data = await res.json();
        if (data.likes !== undefined) {
          globalLikes[itemId] = data.likes;
          localStorage.removeItem(`liked_${itemId}`);
          setLocalLiked(false);
          listeners.forEach((fn) => fn());
        }
        return;
      }
      // 未赞 → 点赞
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: itemId }),
      });
      const data = await res.json();
      if (data.likes !== undefined) {
        globalLikes[itemId] = data.likes;
        localStorage.setItem(`liked_${itemId}`, "1");
        setLocalLiked(true);
        listeners.forEach((fn) => fn());
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        handleLike();
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: localLiked ? "rgba(201,169,110,0.12)" : "transparent",
        border: `1px solid ${localLiked ? "var(--accent)" : "var(--border)"}`,
        borderRadius: 20,
        padding: "2px 10px",
        cursor: loading ? "wait" : "pointer",
        color: localLiked ? "var(--accent)" : "var(--text-muted)",
        fontSize: 12,
        lineHeight: "20px",
        transition: "all 0.3s ease",
        fontFamily: "inherit",
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill={localLiked ? "var(--accent)" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        style={{ transition: "all 0.3s ease" }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 ? count : ""}
    </button>
  );
}

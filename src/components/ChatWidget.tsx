"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_owner: boolean;
}

interface Conversation {
  id: string;
  visitor_id: string;
  last_message: string | null;
  last_message_at: string;
  profiles?: Profile;
  unread_count?: number;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
}

export default function ChatWidget() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"auth" | "otp" | "list" | "chat">("auth");
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [activeConvProfile, setActiveConvProfile] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [username, setUsername] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) {
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
      return;
    }
    if (!countdownRef.current) {
      countdownRef.current = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => { if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; } };
  }, [countdown]);

  // 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // 获取用户资料 + 邮箱同步定时器
  useEffect(() => {
    if (!user) { setProfile(null); setView("auth"); return; }
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setProfile(data);
        setView("list");
        loadConversations();
        // 作者登录时，定时同步邮箱回复
        if (data.is_owner) {
          fetch("/api/sync-email").catch(() => {});
          const interval = setInterval(() => {
            fetch("/api/sync-email").catch(() => {});
          }, 3600000); // 每1小时同步一次
          return () => clearInterval(interval);
        }
      }
    });
  }, [user]); // eslint-disable-line

const loadConversations = async () => {
    const { data, error } = await supabase
      .from("conversations")
      .select("*, profiles!conversations_visitor_id_fkey(*)")
      .order("last_message_at", { ascending: false });

    if (!data || data.length === 0) return;

    // 补全 last_message + 计算未读数，一次性循环
    const convsFixed = await Promise.all(data.map(async (conv) => {
      let fixed = { ...conv };

      // 如果 last_message 为空，从 messages 表取最后一条
      if (!conv.last_message) {
        const { data: msgs } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (msgs && msgs.length > 0) {
          fixed.last_message = msgs[0].content;
          fixed.last_message_at = msgs[0].created_at;
        }
      }

      // 计算未读数
      if (user) {
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .eq("read", false);
        fixed.unread_count = count || 0;
      }

      return fixed;
    }));

    setConversations(convsFixed);
  };

  // 监听新消息（未读红点）
  useEffect(() => {
    const channel = supabase
      .channel("new-message")
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
      }, () => {
        if (view !== "chat") setHasNewMessage(true);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [view]);

  useEffect(() => {
    if (!activeConv) return;
    const channel = supabase
      .channel(`messages:${activeConv}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `conversation_id=eq.${activeConv}`,
      }, (payload) => setMessages((prev) => [...prev, payload.new as Message]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ============ 密码登录 ============
  const handleLogin = async () => {
    if (!email.trim() || !password) { setError("请输入邮箱和密码"); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (err) setError(err.message);
    } finally { setLoading(false); }
  };

  // ============ 注册 - 发送验证码 ============
  const handleRegister = async () => {
    if (!username.trim()) { setError("请输入昵称"); return; }
    if (!email.trim()) { setError("请输入邮箱"); return; }
    if (password.length < 6) { setError("密码至少6位"); return; }
    if (password !== confirmPwd) { setError("两次密码不一致"); return; }
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { shouldCreateUser: true },
      });
      if (err) { setError(err.message); return; }
      setCountdown(60);
      setView("otp");
    } finally { setLoading(false); }
  };

  // ============ 验证验证码 ============
  const verifyOtp = async () => {
    if (otpCode.length < 6) { setError("请输入验证码"); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: otpCode,
        type: "email",
      });
      if (err) { setError(err.message); return; }
      if (data.user) {
        const { data: existing } = await supabase
          .from("profiles").select("id").eq("id", data.user.id).maybeSingle();
        if (!existing) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            username: username.trim(),
            is_owner: false,
          });
        }
        // 设置密码
        await supabase.auth.updateUser({ password });
      }
    } finally { setLoading(false); }
  };

  const resendOtp = async () => {
    if (countdown > 0) return;
    setLoading(true); setError("");
    try {
      const { error: err } = await supabase.auth.signInWithOtp({ email: email.trim() });
      if (err) { setError(err.message); return; }
      setCountdown(60);
    } finally { setLoading(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView("auth"); setActiveConv(null); setMessages([]);
    setEmail(""); setPassword(""); setConfirmPwd(""); setUsername(""); setOtpCode("");
  };

  // ============ 对话 ============
  const createOrGetConversation = async (targetId?: string) => {
    if (!user) return null;
    if (targetId) {
      const { data } = await supabase.from("conversations").select("*").eq("visitor_id", targetId).maybeSingle();
      if (data) return data.id;
      const { data: nc } = await supabase.from("conversations").insert({ visitor_id: targetId }).select().single();
      return nc?.id ?? null;
    }
    const { data: existing } = await supabase.from("conversations").select("*").eq("visitor_id", user.id).maybeSingle();
    if (existing) return existing.id;
    const { data: nc } = await supabase.from("conversations").insert({ visitor_id: user.id }).select().single();
    loadConversations();
    return nc?.id ?? null;
  };

  const openChat = async (convId: string) => {
    setActiveConv(convId); setView("chat");
    // 立即本地去掉红点
    setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_count: 0 } : c));
    // 加载对方的 profile
    const conv = conversations.find(c => c.id === convId);
    if (conv?.profiles) {
      setActiveConvProfile(conv.profiles);
    } else {
      // 从对话列表没找到，手动查
      const { data: convData } = await supabase.from("conversations").select("*, profiles!conversations_visitor_id_fkey(*)").eq("id", convId).single();
      if (convData?.profiles) setActiveConvProfile(convData.profiles);
    }
    const { data } = await supabase.from("messages").select("*").eq("conversation_id", convId).order("created_at", { ascending: true });
    if (data) setMessages(data);
    // 标记该对话消息为已读
    if (user) {
      await supabase.from("messages").update({ read: true }).eq("conversation_id", convId).neq("sender_id", user.id).eq("read", false);
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const startNewChat = async () => {
    const convId = await createOrGetConversation();
    if (convId) openChat(convId);
  };

  // ============ 发消息 ============
  const sendMessage = async () => {
    if (!input.trim() || !activeConv || !user) return;
    const content = input.trim(); setInput("");
    
    await supabase.from("messages").insert({ conversation_id: activeConv, sender_id: user.id, content });
    
    const { error } = await supabase.from("conversations")
      .update({ last_message: content, last_message_at: new Date().toISOString() }).eq("id", activeConv);
    
    // 如果不是作者发的，发邮件通知作者
    if (!profile?.is_owner) {
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: profile?.username ?? "访客", content, conversationId: activeConv }),
      }).catch(() => {}); // 静默失败，不影响发消息
    }
    
    await loadConversations();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const fmtTime = (t: string) => {
    const d = new Date(t); const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  };

  // ============ 渲染 ============
  return (
    <>
      <button className="chat-bubble" onClick={() => { setOpen(!open); if (open) setHasNewMessage(false); }} aria-label="联系作者">
        {open ? "✕" : "联系作者"}
        {hasNewMessage && !open && <span className="chat-bubble-dot" />}
      </button>

      {open && (
        <div className="chat-window" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
          <div className="chat-header">
            <span className="chat-header-title">
              {view === "chat" && activeConv ? (
                <button onClick={() => { setView("list"); setActiveConv(null); setMessages([]); loadConversations(); }} className="chat-back-btn">←</button>
              ) : null}
              {view === "otp" ? "验证邮箱" : profile?.is_owner ? "收件箱" : "私信"}
            </span>
            {user && view !== "otp" && (
              <button onClick={handleLogout} className="chat-logout">退出</button>
            )}
          </div>

          {/* ===== 登录 / 注册 ===== */}
          {view === "auth" && (
            <div className="chat-auth">
              <div className="chat-auth-title">
                {authTab === "login" ? "欢迎回来" : "创建账号"}
              </div>
              <div className="chat-auth-tabs">
                <button className={`chat-tab ${authTab === "login" ? "chat-tab-active" : ""}`}
                  onClick={() => { setAuthTab("login"); setError(""); }}>登录</button>
                <button className={`chat-tab ${authTab === "register" ? "chat-tab-active" : ""}`}
                  onClick={() => { setAuthTab("register"); setError(""); }}>注册</button>
              </div>

              {authTab === "register" && (
                <input className="chat-input" placeholder="昵称" value={username}
                  onChange={(e) => setUsername(e.target.value)} />
              )}
              <input className="chat-input" type="email" placeholder="邮箱" value={email}
                onChange={(e) => setEmail(e.target.value)} />
              <input className="chat-input" type="password"
                placeholder={authTab === "register" ? "密码（至少6位）" : "密码"}
                value={password} onChange={(e) => setPassword(e.target.value)}
                onKeyDown={authTab === "login" ? (e) => e.key === "Enter" && handleLogin() : undefined} />
              {authTab === "register" && (
                <input className="chat-input" type="password" placeholder="确认密码" value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()} />
              )}
              {error && <div className="chat-error">{error}</div>}
              {authTab === "login" ? (
                <button className="chat-auth-btn" onClick={handleLogin} disabled={loading}>
                  {loading ? "登录中..." : "登录"}
                </button>
              ) : (
                <button className="chat-auth-btn" onClick={handleRegister} disabled={loading}>
                  {loading ? "发送中..." : "注册并发送验证码"}
                </button>
              )}
            </div>
          )}

          {/* ===== 验证码 ===== */}
          {view === "otp" && (
            <div className="chat-auth">
              <div className="chat-auth-title">验证你的邮箱</div>
              <div className="chat-auth-desc">
                6位验证码已发送到 <span className="chat-email-highlight">{email}</span>
              </div>
              <input className="chat-input chat-otp-input" type="text" inputMode="numeric"
                maxLength={8} placeholder="请输入验证码" value={otpCode} autoFocus
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
                onKeyDown={(e) => e.key === "Enter" && verifyOtp()} />
              {error && <div className="chat-error">{error}</div>}
              <button className="chat-auth-btn" onClick={verifyOtp} disabled={loading || otpCode.length < 6}>
              </button>
              <button className="chat-switch-btn" onClick={resendOtp} disabled={countdown > 0}
                style={{ opacity: countdown > 0 ? 0.4 : 1 }}>
                {countdown > 0 ? `重新发送 (${countdown}s)` : "重新发送验证码"}
              </button>
              <button className="chat-switch-btn" onClick={() => { setView("auth"); setOtpCode(""); setError(""); }}>
                ← 返回修改
              </button>
            </div>
          )}

          {/* ===== 对话列表 ===== */}
          {view === "list" && (
            <div className="chat-list">
              {!profile?.is_owner && (
                <button className="chat-new-btn" onClick={startNewChat}>✏️ 给杜涛发消息</button>
              )}
              {conversations.length === 0 && <div className="chat-empty">暂无对话</div>}
              {conversations.map((conv) => (
                <div key={conv.id} className="chat-conv-item" onClick={() => openChat(conv.id)}>
                  <div className="chat-conv-avatar">
                    {profile?.is_owner ? (conv.profiles?.username?.[0] ?? "访") : "杜"}
                    {(conv.unread_count || 0) > 0 && <span className="chat-conv-avatar-dot" />}
                  </div>
                  <div className="chat-conv-info">
                    <div className="chat-conv-name">{profile?.is_owner ? (conv.profiles?.username ?? "访客") : "杜涛"}</div>
                    <div className="chat-conv-last">{conv.last_message ?? "暂无消息"}</div>
                  </div>
                  <div className="chat-conv-time">{fmtTime(conv.last_message_at)}</div>
                </div>
              ))}
            </div>
          )}

          {/* ===== 聊天 ===== */}
          {view === "chat" && activeConv && (
            <>
              <div className="chat-messages" onWheel={(e) => e.stopPropagation()} onTouchMove={(e) => e.stopPropagation()}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`chat-msg ${msg.sender_id === user?.id ? "chat-msg-self" : "chat-msg-other"}`}>
                    {msg.sender_id !== user?.id && profile?.is_owner && (
                      <div className="chat-msg-sender">{activeConvProfile?.username ?? "访客"}</div>
                    )}
                    <div className="chat-msg-bubble">{msg.content}</div>
                    <div className="chat-msg-time">{fmtTime(msg.created_at)}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="chat-input-bar">
                <input ref={inputRef} className="chat-input chat-input-msg" placeholder="输入消息..."
                  value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} />
                <button className="chat-send-btn" onClick={sendMessage} disabled={!input.trim()}>发送</button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}

import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://dyokmmaqstnfkxecrgzj.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// GET /api/likes — 获取所有点赞数
export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/likes?select=item_id,likes`, {
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
      },
    });
    const data = await res.json();
    // 转成 { [itemId]: likes } 格式
    const map: Record<string, number> = {};
    for (const row of data) {
      map[row.item_id] = row.likes;
    }
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

// POST /api/likes — 点赞（防刷：每IP每项每天1次）
export async function POST(req: NextRequest) {
  try {
    const { item_id } = await req.json();
    if (!item_id || typeof item_id !== "string") {
      return NextResponse.json({ error: "item_id required" }, { status: 400 });
    }

    // 用IP+item_id做简单防刷
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const fingerprint = `${ip}:${item_id}`;

    // 检查是否今天已点过（用Supabase的 like_logs 表）
    const today = new Date().toISOString().slice(0, 10);
    const logCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/like_logs?fingerprint=eq.${encodeURIComponent(fingerprint)}&created_at=gte.${today}&select=id`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const logs = await logCheck.json();
    if (logs.length > 0) {
      // 已经点过了，还是返回当前计数
      const countRes = await fetch(
        `${SUPABASE_URL}/rest/v1/likes?item_id=eq.${encodeURIComponent(item_id)}&select=likes`,
        { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
      );
      const countData = await countRes.json();
      return NextResponse.json({ likes: countData[0]?.likes || 0, already: true });
    }

    // 记录日志
    await fetch(`${SUPABASE_URL}/rest/v1/like_logs`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ fingerprint, item_id }),
    });

    // 更新点赞计数（upsert）
    const existing = await fetch(
      `${SUPABASE_URL}/rest/v1/likes?item_id=eq.${encodeURIComponent(item_id)}&select=id,likes`,
      { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } }
    );
    const existingData = await existing.json();

    let newLikes: number;
    if (existingData.length > 0) {
      newLikes = (existingData[0].likes || 0) + 1;
      await fetch(`${SUPABASE_URL}/rest/v1/likes?id=eq.${existingData[0].id}`, {
        method: "PATCH",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ likes: newLikes }),
      });
    } else {
      newLikes = 1;
      await fetch(`${SUPABASE_URL}/rest/v1/likes`, {
        method: "POST",
        headers: {
          apikey: SERVICE_KEY,
          Authorization: `Bearer ${SERVICE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ item_id, likes: newLikes }),
      });
    }

    return NextResponse.json({ likes: newLikes });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

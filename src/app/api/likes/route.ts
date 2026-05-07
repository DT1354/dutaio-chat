import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = "https://dyokmmaqstnfkxecrgzj.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const headers = () => ({
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
});

// GET /api/likes — 获取所有点赞数
export async function GET() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/likes?select=item_id,likes`, {
      headers: headers(),
    });
    const data = await res.json();
    const map: Record<string, number> = {};
    for (const row of data) {
      map[row.item_id] = row.likes;
    }
    return NextResponse.json(map);
  } catch {
    return NextResponse.json({}, { status: 500 });
  }
}

// POST /api/likes — 点赞或取消点赞
// body: { item_id, action: "like" | "unlike" }
export async function POST(req: NextRequest) {
  try {
    const { item_id, action = "like" } = await req.json();
    if (!item_id || typeof item_id !== "string") {
      return NextResponse.json({ error: "item_id required" }, { status: 400 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
    const fingerprint = `${ip}:${item_id}`;

    if (action === "unlike") {
      // === 取消点赞 ===
      // 检查是否点过
      const logCheck = await fetch(
        `${SUPABASE_URL}/rest/v1/like_logs?fingerprint=eq.${encodeURIComponent(fingerprint)}&item_id=eq.${encodeURIComponent(item_id)}&select=id`,
        { headers: headers() }
      );
      const logs = await logCheck.json();
      if (logs.length === 0) {
        // 没点过，无法取消
        const countRes = await fetch(
          `${SUPABASE_URL}/rest/v1/likes?item_id=eq.${encodeURIComponent(item_id)}&select=likes`,
          { headers: headers() }
        );
        const countData = await countRes.json();
        return NextResponse.json({ likes: countData[0]?.likes || 0 });
      }

      // 删除日志
      await fetch(
        `${SUPABASE_URL}/rest/v1/like_logs?id=eq.${logs[0].id}`,
        { method: "DELETE", headers: headers() }
      );

      // 减少计数
      const existing = await fetch(
        `${SUPABASE_URL}/rest/v1/likes?item_id=eq.${encodeURIComponent(item_id)}&select=id,likes`,
        { headers: headers() }
      );
      const existingData = await existing.json();
      let newLikes = 0;
      if (existingData.length > 0) {
        newLikes = Math.max(0, (existingData[0].likes || 1) - 1);
        await fetch(`${SUPABASE_URL}/rest/v1/likes?id=eq.${existingData[0].id}`, {
          method: "PATCH",
          headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
          body: JSON.stringify({ likes: newLikes }),
        });
      }

      return NextResponse.json({ likes: newLikes });
    }

    // === 点赞 ===
    // 检查是否已点过
    const logCheck = await fetch(
      `${SUPABASE_URL}/rest/v1/like_logs?fingerprint=eq.${encodeURIComponent(fingerprint)}&item_id=eq.${encodeURIComponent(item_id)}&select=id`,
      { headers: headers() }
    );
    const logs = await logCheck.json();
    if (logs.length > 0) {
      const countRes = await fetch(
        `${SUPABASE_URL}/rest/v1/likes?item_id=eq.${encodeURIComponent(item_id)}&select=likes`,
        { headers: headers() }
      );
      const countData = await countRes.json();
      return NextResponse.json({ likes: countData[0]?.likes || 0, already: true });
    }

    // 记录日志（永久，不按天清）
    await fetch(`${SUPABASE_URL}/rest/v1/like_logs`, {
      method: "POST",
      headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ fingerprint, item_id }),
    });

    // 更新计数
    const existing = await fetch(
      `${SUPABASE_URL}/rest/v1/likes?item_id=eq.${encodeURIComponent(item_id)}&select=id,likes`,
      { headers: headers() }
    );
    const existingData = await existing.json();

    let newLikes: number;
    if (existingData.length > 0) {
      newLikes = (existingData[0].likes || 0) + 1;
      await fetch(`${SUPABASE_URL}/rest/v1/likes?id=eq.${existingData[0].id}`, {
        method: "PATCH",
        headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ likes: newLikes }),
      });
    } else {
      newLikes = 1;
      await fetch(`${SUPABASE_URL}/rest/v1/likes`, {
        method: "POST",
        headers: { ...headers(), "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ item_id, likes: newLikes }),
      });
    }

    return NextResponse.json({ likes: newLikes });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

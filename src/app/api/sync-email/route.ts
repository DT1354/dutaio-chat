import { NextResponse } from "next/server";
import { ImapFlow } from "imapflow";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  console.log("=== 邮箱同步开始 ===");

  const client = new ImapFlow({
    host: "imap.163.com",
    port: 993,
    secure: true,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
    logger: false as any,
  });

  try {
    await client.connect();
    console.log("IMAP 连接成功");
    const lock = await client.getMailboxLock("INBOX");

    try {
      // 获取最近50封邮件的 UID
      const uids = await client.search({ recent: 50 });
      // 如果上面的不行，用 all 然后手动取最新的
      let allUids: string[] | number[] = uids;
      if (!allUids || allUids.length === 0) {
        allUids = await client.search({ all: true });
      }

console.log("所有邮件 UID 数量:", allUids.length);

      // 取最新的30封
      const recentUids = allUids.slice(-30);
      let synced = 0;

      for (const uid of recentUids) {
        const msg = await client.fetchOne(uid, {
          envelope: true,
          source: true,
        });

        if (!msg) { console.log("UID", uid, "读取失败"); continue; }

        const subject = msg.envelope?.subject || "";
        console.log("UID", uid, "主题:", subject);

        // 从 subject 提取 conversationId
        const match = subject.match(/\[chat:([a-f0-9-]+)\]/);
        if (!match) { console.log("不是聊天通知邮件，跳过"); continue; }

        const conversationId = match[1];

        // 关键：区分原始通知邮件 vs 回复邮件
        // 回复邮件有 inReplyTo，原始通知没有
        const inReplyTo = msg.envelope?.inReplyTo;
        if (!inReplyTo) {
          console.log("这是原始通知邮件（不是回复），跳过");
          continue;
        }

        console.log("这是回复邮件，inReplyTo:", inReplyTo);

        // 解析邮件正文 - 从 raw source 提取并正确解码
        let body = "";
        if (typeof msg.source === "string") {
          body = msg.source;
        } else if (Buffer.isBuffer(msg.source)) {
          body = msg.source.toString("binary");
        }

        // 用简单邮件解析器提取正文
        // 1. 找到 text/plain 部分
        let decodedText = "";

        // 按 boundary 分割 multipart
        const boundaryMatch = body.match(/boundary="?([^"\r\n]+)"?/i);
        if (boundaryMatch) {
          const boundary = boundaryMatch[1];
          const parts = body.split("--" + boundary);

          for (const part of parts) {
            // 找 text/plain 部分
            if (/Content-Type:\s*text\/plain/i.test(part) && !/Content-Type:\s*text\/html/i.test(part)) {
              // 提取编码方式
              const encodingMatch = part.match(/Content-Transfer-Encoding:\s*(\S+)/i);
              const encoding = encodingMatch ? encodingMatch[1].toLowerCase().trim() : "7bit";

              // 提取正文内容（header 和 body 之间用空行分隔）
              const bodyMatch = part.match(/\r?\n\r?\n([\s\S]*)$/);
              if (!bodyMatch) continue;

              let rawBody = bodyMatch[1].replace(/\r?\n--$/, "").trim();

              if (encoding === "base64") {
                try {
                  decodedText = Buffer.from(rawBody.replace(/\s/g, ""), "base64").toString("utf-8");
                } catch (e) {
                  console.log("base64 解码失败:", e);
                }
              } else if (encoding === "quoted-printable") {
                decodedText = rawBody.replace(/=\r?\n/g, "").replace(/=([0-9A-F]{2})/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
                try { decodedText = decodeURIComponent(escape(decodedText)); } catch {}
              } else {
                decodedText = rawBody;
              }

              if (decodedText) break;
            }
          }
        }

        // 如果没有 boundary，直接提取
        if (!decodedText) {
          const encodingMatch = body.match(/Content-Transfer-Encoding:\s*(\S+)/i);
          const encoding = encodingMatch ? encodingMatch[1].toLowerCase().trim() : "7bit";
          const bodyMatch = body.match(/\r?\n\r?\n([\s\S]*)$/);
          if (bodyMatch) {
            let rawBody = bodyMatch[1].trim();
            if (encoding === "base64") {
              try {
                decodedText = Buffer.from(rawBody.replace(/\s/g, ""), "base64").toString("utf-8");
              } catch {}
            } else {
              decodedText = rawBody;
            }
          }
        }

        console.log("解码后正文:", decodedText.slice(0, 200));

        // 清理引用内容
        const cleanBody = decodedText
          .split(/-{3,}\s*回复的原邮件\s*-{3,}|-----Original Message-----|-----原始消息-----|On .* wrote:|在 .*写道：|发件人：|\n>\s/m)[0]
          .replace(/\r?\n/g, " ")
          .trim();

        console.log("清理后正文:", cleanBody.slice(0, 100));

        if (!cleanBody || cleanBody.length < 2) { console.log("正文为空，跳过"); continue; }

        // 获取 owner 的 user id
        const { data: ownerProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("is_owner", true)
          .single();

        if (!ownerProfile) { console.log("找不到作者账号"); continue; }

        // 检查是否已经同步过
        const { data: existing } = await supabase
          .from("messages")
          .select("id")
          .eq("conversation_id", conversationId)
          .eq("sender_id", ownerProfile.id)
          .eq("content", cleanBody)
          .maybeSingle();

        if (existing) { console.log("已同步过，跳过"); continue; }

        // 插入消息
        const { error: insertErr } = await supabase.from("messages").insert({
          conversation_id: conversationId,
          sender_id: ownerProfile.id,
          content: cleanBody,
          read: true,
        });

        if (insertErr) { console.log("插入失败:", insertErr); continue; }

        // 更新对话
        await supabase
          .from("conversations")
          .update({
            last_message: cleanBody,
            last_message_at: new Date().toISOString(),
          })
          .eq("id", conversationId);

        console.log("同步成功:", conversationId, cleanBody.slice(0, 50));
        synced++;

        // 标记邮件为已读
        await client.messageFlagsSet(uid, ["\\Seen"], { add: true });
      }

      return NextResponse.json({ ok: true, synced, message: `同步了 ${synced} 条回复` });
    } finally {
      lock.release();
    }
  } catch (err) {
    console.error("邮箱同步失败:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  } finally {
    try { await client.logout(); } catch {}
  }
}

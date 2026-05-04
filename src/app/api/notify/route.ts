import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { sender, content, conversationId } = await req.json();
    if (!sender || !content) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: "smtp.163.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // subject 里带 conversationId，方便回复时匹配
    const convTag = conversationId ? `[chat:${conversationId}]` : "";
    await transporter.sendMail({
      from: `"个人网站消息通知" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: `${convTag} 新消息来自 ${sender}`,
      text: `${sender} 给你发了一条消息：\n\n${content}\n\n请前往网站回复：https://yy.050134.xyz`,
      // 添加自定义 header 方便匹配
      headers: {
        "X-Conversation-Id": conversationId || "",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("邮件发送失败:", err);
    return NextResponse.json({ error: "发送失败" }, { status: 500 });
  }
}

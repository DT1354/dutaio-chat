-- 用户资料表（扩展 Supabase Auth 自带的信息）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  is_owner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 对话表
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  visitor_id UUID REFERENCES profiles(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 消息表
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 开启 Realtime（实时推送）
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- 权限：开启行级安全
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- profiles 权限
CREATE POLICY "用户可以看所有资料" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户可以更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "用户可以插入自己的资料" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- conversations 权限
CREATE POLICY "用户可以创建对话" ON conversations FOR INSERT WITH CHECK (auth.uid() = visitor_id);
CREATE POLICY "用户可以看自己的对话" ON conversations FOR SELECT USING (auth.uid() = visitor_id OR true);

-- messages 权限
CREATE POLICY "用户可以看自己对话的消息" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations WHERE conversations.id = messages.conversation_id AND (conversations.visitor_id = auth.uid() OR true))
);
CREATE POLICY "用户可以发消息" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

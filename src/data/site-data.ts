// site-data.ts — 杜涛个人作品集 完整数据

function safePath(path: string): string {
  return path.split("/").map(encodeURIComponent).join("/");
}

// ===== 联系方式 =====
export const contact = {
  wechat: "d15285406783",
  phone: "15285406783",
  qq: "1602788464",
  email: "15285406783@163.com",
  wechatPublic: "jealousyAI",
  xiaohongshu: "dandelion",
};

// ===== 个人信息 =====
export const profile = {
  name: "杜涛",
  nameEn: "Dandelion",
  location: "贵州 → 重庆",
  school: "西南大学 · 园艺专业 · 大二",
  personality: "INFP",
  award: "国家励志奖学金",
  bio: "AI内容创作者 · 提示词工程师 · 系统化学习者",
  tagline: "不只是工具的使用者，更是工具的设计者。",
  story: "从高中不敢举手、内心压抑，到大学主动竞选班长。从焦虑迷茫到建立15万字知识库、运营90+篇公众号文章。喜欢摄影、跑步、猫咪，梦想是成为数字游民，在大理和昆明常住。",
};

// ===== 数字证据 =====
export const stats = [
  { value: "190+", label: "AI艺术作品" },
  { value: "6", label: "AI视频" },
  { value: "600+", label: "公众号粉丝" },
  { value: "90+", label: "原创文章" },
  { value: "15万", label: "AI知识库（字）" },
  { value: "12万", label: "个人笔记（字）" },
  { value: "1000+", label: "日更朋友圈" },
  { value: "24+", label: "完整项目周期" },
  { value: "422", label: "小红书粉丝" },
];

// ===== 核心技能 =====
export const skills = [
  {
    category: "提示词工程",
    items: ["结构化8模块框架", "三级视觉焦点体系", "负面提示词约束", "参考图驱动生成", "gpt-image-2 API"],
  },
  {
    category: "AI工具生态",
    items: ["Claude Code", "Oh My OpenCode", "Cursor/Trae", "MCP协议", "40+ Skills"],
  },
  {
    category: "AIGC创作",
    items: ["AI摄影", "AI视频(seedance/veo3.1)", "AI绘画", "智能体搭建", "工作流自动化"],
  },
  {
    category: "开发技术",
    items: ["Python", "TypeScript", "Next.js", "React", "Supabase"],
  },
  {
    category: "技术能力",
    items: ["Web逆向工程", "OAuth代理部署", "Docker容器化", "Git版本管理", "npm生态"],
  },
  {
    category: "内容创作",
    items: ["公众号运营", "小红书运营", "md2wechat排版", "数据分析复盘", "爆款文章设计"],
  },
];

// ===== 项目经验 =====
export const projects = [
  {
    title: "鬼灭之刃电影海报系列",
    period: "2026.04–05",
    description: "基于gpt-image-2 API系统化实践提示词工程，设计三级视觉焦点体系，完成血月花影·雷眠一闪·静水断罪三张概念海报。",
    tech: ["Python", "gpt-image-2 API", "提示词工程"],
  },
  {
    title: "Dandelion APP",
    period: "2025",
    description: "番茄钟·白噪音·习惯记录·便签·热力图·心情签一体化个人成长工具。全程Vibe Coding。",
    tech: ["React", "Supabase", "Vibe Coding"],
  },
  {
    title: "AI API代理服务部署",
    period: "2026.03",
    description: "分析CLIProxyAPI完整Go源码，部署OAuth代理将AI订阅转为本地API，实现多账号负载均衡。",
    tech: ["Go", "OAuth 2.0", "Docker", "API代理"],
  },
  {
    title: "Web逆向工程研究",
    period: "2026.03",
    description: "完整分析小红书API签名算法（XOR/自定义Base64/RC4/AES-128-CBC），浏览器指纹模拟，反检测策略。",
    tech: ["Python", "逆向工程", "加密算法"],
  },
  {
    title: "AI城市视频系列",
    period: "2025–2026",
    description: "泉州·贵州·大理·杭州·张家界·西安·敦煌·拉萨·北京·上海·澳门·重庆·广东……概念设定→AI出图→动态生成→剪辑调色。",
    tech: ["seedance 2.0", "veo 3.1", "剪映Pro"],
  },
  {
    title: "公众号全流程自动化",
    period: "2026.02–至今",
    description: "建立选题调研→AI写作→md2wechat排版→发布→数据复盘全流程，90+篇原创，多篇上千阅读。",
    tech: ["Claude Code", "md2wechat", "自动化工作流"],
  },
  {
    title: "Python爬虫开发",
    period: "2026.02",
    description: "微博文章爬取→Markdown→Word文档，处理中文编码问题，完成最小可行产品验证。",
    tech: ["Python", "BeautifulSoup", "python-docx"],
  },
];

// ===== 爆款文章 =====
export const articles = [
  "如果人也是LLM，那人生这个loop的提示词到底是什么？",
  "一个3.8万star的偏执项目，用纯JS重写了浏览器文本引擎",
  "你的新Office三件套：MD、CSV、HTML",
  "Byte→Token范式转移（基于Karpathy推文）",
  "水墨画风四季轮转AI视频设计方法论",
  "智谱AutoClaw产品分析",
];

// ===== 视频路径 =====
export const videos = [
  { title: "水墨风春夏秋冬四季轮转", src: safePath("/assets/videos/水墨风春夏秋冬四级轮转.mp4") },
  { title: "贵州", src: safePath("/assets/videos/贵州.mp4") },
  { title: "城市", src: safePath("/assets/videos/城市.mp4") },
  { title: "海底", src: safePath("/assets/videos/海底.mp4") },
  { title: "门", src: safePath("/assets/videos/门.mp4") },
  { title: "自创角色PV", src: safePath("/assets/videos/自创角色pv.mp4") },
];

// ===== 所有作品图 =====
export const allArtworks: string[] = [
  "/assets/artworks-compressed/_creative_concept__2k_202601012303.webp",
  "/assets/artworks-compressed/_meta__2k_202512311945 (1).webp",
  "/assets/artworks-compressed/_meta__2k_202512311945.webp",
  "/assets/artworks-compressed/_meta__2k_202512311951.webp",
  "/assets/artworks-compressed/_mixue_chinese_typography_design_suite__.webp",
  "/assets/artworks-compressed/_mixue_product_photography_suite__2k_202.webp",
  "/assets/artworks-compressed/_mixue_visual_iteration_v4_bayesian__2k_.webp",
  "/assets/artworks-compressed/_project_name_persimmon_dark_mood_photog.webp",
  "/assets/artworks-compressed/_project_name_steamed_koi_cake_2k_2026.webp",
  "/assets/artworks-compressed/_project_name_studio_tanghulu_art_poster.webp",
  "/assets/artworks-compressed/_style_correction_cyan_focus__2k_2026010.webp",
  "/assets/artworks-compressed/1.webp",
  "/assets/artworks-compressed/1.webp",
  safePath("/assets/artworks-compressed/105E_28N_位置信息图.webp"),
  safePath("/assets/artworks-compressed/110E_25N_位置信息图.webp"),
  "/assets/artworks-compressed/1763949208144.webp",
  "/assets/artworks-compressed/1f67750e-9d72-4466-9f73-ca78bbaac418.webp",
  "/assets/artworks-compressed/3.webp",
  "/assets/artworks-compressed/4c3c0668644df6c6f168a534e704097e.webp",
  "/assets/artworks-compressed/6.webp",
  "/assets/artworks-compressed/662d87c82443a697af577b06c4435652.webp",
  "/assets/artworks-compressed/69eb8a190d68f5354683f3a5.webp",
  "/assets/artworks-compressed/7.webp",
  "/assets/artworks-compressed/979cb20b-d231-4081-b431-c7d9816998c1.webp",
  safePath("/assets/artworks-compressed/里面颜色用合适去填充_2K_202604191637.webp"),
  safePath("/assets/artworks-compressed/长城技术图解.webp"),
  "/assets/artworks-compressed/A_5x5_photo_202603241715.webp",
  "/assets/artworks-compressed/A_5x5_photography_202603241723.webp",
  safePath("/assets/artworks-compressed/a_为贵州设计一张超高完成度的竖版文旅宣传海.webp"),
  "/assets/artworks-compressed/a_A_transcendent_fine-.webp",
  "/assets/artworks-compressed/A_beautiful_cute_young_asian_girl_looking_back_ove_delpmaspu (2).webp",
  "/assets/artworks-compressed/A_beautiful_cute_young_asian_girl_looking_back_ove_delpmaspu (3).webp",
  "/assets/artworks-compressed/A_beautiful_cute_young_asian_girl_looking_back_ove_delpmaspu (4).webp",
  "/assets/artworks-compressed/A_breathtaking_5x5_202603241722.webp",
  "/assets/artworks-compressed/A_cluster_of_202603281631.webp",
  "/assets/artworks-compressed/A_conceptual_paper_202604171158 (1).webp",
  "/assets/artworks-compressed/A_contemporary_Chinese-inspired_202604171150.webp",
  "/assets/artworks-compressed/A_dense_cluster_202603281631.webp",
  "/assets/artworks-compressed/A_dense_cluster_202603281633.webp",
  "/assets/artworks-compressed/A_dramatic_5x5_202603241724.webp",
  "/assets/artworks-compressed/A_highend_fresh_2k_202601131928.webp",
  "/assets/artworks-compressed/A_highly_detailed_2k_202601191658.webp",
  "/assets/artworks-compressed/A_highly_detailed_2k_202601191727.webp",
  "/assets/artworks-compressed/A_hyper-realistic_raw_202603221836.webp",
  "/assets/artworks-compressed/A_panoramic_2d_flat_anime_illustration_guofeng_aes_delpmaspu.webp",
  "/assets/artworks-compressed/A_stunning_hyperrealistic_202512031017.webp",
  "/assets/artworks-compressed/A_suitable_art_2k_202512292215.webp",
  "/assets/artworks-compressed/A_suitable_art_2k_202512292216.webp",
  "/assets/artworks-compressed/A_vertical_flat_202512121721.webp",
  "/assets/artworks-compressed/A_vertical_flat_202512121731.webp",
  "/assets/artworks-compressed/A_vertical_flat_202512121733.webp",
  "/assets/artworks-compressed/A_vertical_magazine_2k_202512212237.webp",
  "/assets/artworks-compressed/An_award-level_Chinese-inspired_202604171157.webp",
  "/assets/artworks-compressed/Artistic_portrait_of_an_elegant_asian_woman_wearin_delpmaspu.webp",
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月21日 18_55_57.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月21日 22_42_41.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月26日 22_57_28.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月27日 18_10_11.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月27日 18_33_35.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月27日 18_43_58.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月27日 18_53_05.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月28日 22_42_28.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月29日 10_09_37.webp"),
  safePath("/assets/artworks-compressed/ChatGPT Image 2026年4月29日 11_16_59.webp"),
  "/assets/artworks-compressed/Cinematic_dark_macro_202604131646.webp",
  "/assets/artworks-compressed/Cinematic_double_exposure_202603221125.webp",
  "/assets/artworks-compressed/Cinematic_macro_photography._202604071601.webp",
  "/assets/artworks-compressed/Cinematic_night_scene_512022318.webp",
  "/assets/artworks-compressed/Composition_fullscreen_3d_2k_202512252342.webp",
  "/assets/artworks-compressed/Creative_botanical_art_2k_202512171105.webp",
  "/assets/artworks-compressed/Creative_botanical_art_2k_202512171114.webp",
  "/assets/artworks-compressed/Creative_botanical_art_2k_202512171136.webp",
  "/assets/artworks-compressed/d7fd773e01f30741f0db8306df41b091.webp",
  "/assets/artworks-compressed/Dandelion_2k_delpmaspu.webp",
  "/assets/artworks-compressed/de5a4ee80e74abff2884c1aaf87aba93.webp",
  "/assets/artworks-compressed/Epic_wide_shot_202512111918.webp",
  "/assets/artworks-compressed/National_Geographic_award-winning_202604131646.webp",
  "/assets/artworks-compressed/Night_photography_of_2k_202601191737.webp",
  "/assets/artworks-compressed/Spectacular_National_Geographic_202604132209.webp",
  "/assets/artworks-compressed/Stunning_macro_photography,_202604071542.webp",
  "/assets/artworks-compressed/Stunning_macro_photography,_202604071543.webp",
  "/assets/artworks-compressed/Top-tier_National_Geographic_202604131646.webp",
  "/assets/artworks-compressed/wan2.6-t2i-v2_a_A_gallery-level_conc.webp",
  "/assets/artworks-compressed/Image_202512101120.webp",
  "/assets/artworks-compressed/Plant_name_aloe_2k_202601131940.webp",
  "/assets/artworks-compressed/The_background_is_2k_202601170830.webp",
  "/assets/artworks-compressed/The_background_is_2k_202601170857.webp",
  "/assets/artworks-compressed/The_background_is_2k_202601171158.webp",
  "/assets/artworks-compressed/The_screen_is_202512072337.webp",
  "/assets/artworks-compressed/This_cinematic_3d_202512141132.webp",
  "/assets/artworks-compressed/grok-imagine-image-20260306_b_An_award-level_Chine.webp",
  "/assets/artworks-compressed/Paper_cut_layered_2k_202512201246 (1).webp",
  "/assets/artworks-compressed/Paper_cut_layered_2k_202512201252 (1).webp",
  "/assets/artworks-compressed/Paper_cut_layered_2k_202512201252.webp",
  "/assets/artworks-compressed/Paper_cut_layered_2k_202512201444 (1).webp",
  "/assets/artworks-compressed/Paper_cut_layered_2k_202512201748 (1).webp",
  "/assets/artworks-compressed/Paper_cut_layered_2k_202512201748.webp",
  "/assets/artworks-compressed/Paper_cut_layered_2k_202512201749.webp",
  "/assets/artworks-compressed/Select_a_reallife_202512081103.webp",
  "/assets/artworks-compressed/Subject__tool_2k_202512292237 (1).webp",
  "/assets/artworks-compressed/Subject__tool_2k_202512292246.webp",
  "/assets/artworks-compressed/Subject__tool_2k_202512292254 (2).webp",
  "/assets/artworks-compressed/Subject__tool_2k_202512292254.webp",
  "/assets/artworks-compressed/Please_create_a_202512042216 (1).webp",
  "/assets/artworks-compressed/Please_integrate_the_202512101119 (1).webp",
  "/assets/artworks-compressed/Please_integrate_the_202512101124.webp",
  // Gemini Generated Images (83张)
  "/assets/artworks-compressed/Gemini_Generated_Image_1j51ro1j51ro1j51.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_2g0wz82g0wz82g0w.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_303wff303wff303w.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_35n4lu35n4lu35n4.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_3h4vhx3h4vhx3h4v.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_451fp6451fp6451f.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_4fnu284fnu284fnu.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_4ya6av4ya6av4ya6.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_4zjp3i4zjp3i4zjp_compressed.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_58caxx58caxx58ca_compressed.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_6i6cpk6i6cpk6i6c.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_6j4ydj6j4ydj6j4y.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_6snz246snz246snz.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_70yg3570yg3570yg.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_7c8whk7c8whk7c8w.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_88951y88951y8895.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_8vueix8vueix8vue.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_93pgfq93pgfq93pg.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_9qyond9qyond9qyo.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_9rzdi09rzdi09rzd.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_9ze0569ze0569ze0.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_asqagvasqagvasqa.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_b73b00b73b00b73b.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_bexmmibexmmibexm.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_btashkbtashkbtas.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_c2s3i0c2s3i0c2s3.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_e8f78ye8f78ye8f7.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ee6heeee6heeee6h.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_f1fb8zf1fb8zf1fb.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_fb2tvdfb2tvdfb2t.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ft4wikft4wikft4w.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_fxvz05fxvz05fxvz.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_g3ozu3g3ozu3g3oz_compressed.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_gfoqwgfoqwgfoqwg.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_gjxz0wgjxz0wgjxz.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_h8brznh8brznh8br.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_hac7ebhac7ebhac7.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_heku77heku77heku.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_hp10eqhp10eqhp10.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_id3y4eid3y4eid3y.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ie9txpie9txpie9t.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_im0doxim0doxim0d.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_iy1fmyiy1fmyiy1f.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_j47c5jj47c5jj47c.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_jof644jof644jof6.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_kcs9qfkcs9qfkcs9_compressed.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_kolfkpkolfkpkolf.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_l1ffxtl1ffxtl1ff.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_l3k8wtl3k8wtl3k8.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_lvc1ejlvc1ejlvc1.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_m0jxjom0jxjom0jx_compressed.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_myrbmamyrbmamyrb.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ncltqfncltqfnclt.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ns0tm6ns0tm6ns0t_compressed.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_nu6ypinu6ypinu6y.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_o3137oo3137oo313.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_olj20jolj20jolj2.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_pb2nz3pb2nz3pb2n.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_q146a4q146a4q146 (1).webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_q7df8sq7df8sq7df.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_r1cz2fr1cz2fr1cz.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_rnj5o8rnj5o8rnj5.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ro1mbdro1mbdro1m.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_rz6bjurz6bjurz6b.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_s7es2js7es2js7es.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_u1xaq8u1xaq8u1xa.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ud3ihxud3ihxud3i.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_uhgst5uhgst5uhgs.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_uojzlxuojzlxuojz.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_utr973utr973utr9.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_vd63a3vd63a3vd63.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_wp9jspwp9jspwp9j.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_wslwumwslwumwslw.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_wtxvkbwtxvkbwtxv.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_x1mbmbx1mbmbx1mb.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_xe0n82xe0n82xe0n.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_xqeoa5xqeoa5xqeo.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_yo0d1myo0d1myo0d.webp",
  "/assets/artworks-compressed/Gemini_Generated_Image_ywd1h7ywd1h7ywd1.webp",
  // generated_image 系列 (5张)
  "/assets/artworks-compressed/generated_image_467fb78e-70e2-4f52-9688-dd9e44c9c909.webp",
  "/assets/artworks-compressed/generated_image_80b81107-74ae-4099-b34c-43ba5761cae4.webp",
  "/assets/artworks-compressed/generated_image_9b97a2f2-be2c-4378-9c50-781b4ffe7a01.webp",
  "/assets/artworks-compressed/generated_image_eee98c78-b84e-46bd-963d-cbf485e50b78.webp",
  "/assets/artworks-compressed/generated_image_f3236a91-e703-4efc-965f-288c6ec80595.webp",
];

// Gemini系列
export const geminiArtworks = allArtworks.filter((p) => p.includes("Gemini_Generated_Image"));
// ChatGPT图片
export const chatgptArtworks = allArtworks.filter((p) => p.includes("ChatGPT"));
// 蜜雪/产品摄影
export const productArtworks = allArtworks.filter(
  (p) => p.includes("mixue") || p.includes("tanghulu") || p.includes("koi_cake") || p.includes("persimmon")
);
// 国家地理/微距
export const macroArtworks = allArtworks.filter(
  (p) => p.includes("National_Geographic") || p.includes("macro") || p.includes("Macro")
);

// APP截图
export const appScreens = [
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112104_346_1319.webp"),
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112106_347_1319.webp"),
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112108_348_1319.webp"),
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112111_349_1319.webp"),
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112113_350_1319.webp"),
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112116_351_1319.webp"),
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112118_352_1319.webp"),
  safePath("/assets/dandelion-app-compressed/微信图片_20260319112121_353_1319.webp"),
  "/assets/dandelion-app-compressed/Gemini_Generated_Image_dn2xtqdn2xtqdn2x.webp",
];

// 个人照片
export const personalPhotos = [
  safePath("/assets/photos-compressed/黑白高端时尚肖像_真实面孔.webp"),
  safePath("/assets/photos-compressed/微信图片_20260319112144_355_1319.webp"),
];

// 知识库截图
export const knowledgeBaseScreens = [
  "/assets/knowledge-base-compressed/ai-kb.webp",
  safePath("/assets/knowledge-base-compressed/AI学习知识库/AI学习知识库.webp"),
  safePath("/assets/knowledge-base-compressed/AI学习知识库/屏幕截图 2026-05-02 114909.webp"),
  safePath("/assets/knowledge-base-compressed/AI学习知识库/屏幕截图 2026-05-02 115006.webp"),
  safePath("/assets/knowledge-base-compressed/个人笔记，摘录，思考知识库/屏幕截图 2026-05-02 115106.webp"),
  safePath("/assets/knowledge-base-compressed/个人笔记，摘录，思考知识库/屏幕截图 2026-05-02 115203.webp"),
  safePath("/assets/knowledge-base-compressed/个人笔记，摘录，思考知识库/屏幕截图 2026-05-02 115239.webp"),
  safePath("/assets/knowledge-base-compressed/个人笔记，摘录，思考知识库/屏幕截图 2026-05-02 115319.webp"),
];

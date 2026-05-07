const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// 只处理 knowledge-base-compressed（其他目录已水印完成）
const DIR = "public/assets/knowledge-base-compressed";

function makeWatermarkSvg(width, height) {
  const fontSize = Math.max(16, Math.round(Math.min(width, height) * 0.04));
  const x = width - fontSize * 3;
  const y = height - fontSize * 1.2;
  return `<svg width="${width}" height="${height}">
    <text x="${x}" y="${y}" 
      font-family="sans-serif" 
      font-size="${fontSize}" 
      font-weight="600"
      fill="rgba(201,169,110,0.25)" 
      letter-spacing="0.1em">杜涛</text>
  </svg>`;
}

function collectImages(rootDir) {
  const results = [];
  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) walk(full, relPath);
      else if (/\.(webp|jpg|jpeg|png)$/i.test(entry.name)) results.push({ full, relPath });
    }
  }
  walk(rootDir, "");
  return results;
}

async function processFile(srcPath, dstPath) {
  try {
    const meta = await sharp(srcPath).metadata();
    const svg = Buffer.from(makeWatermarkSvg(meta.width, meta.height));
    await sharp(srcPath).composite([{ input: svg, gravity: "southeast" }]).toFile(dstPath);
    return true;
  } catch (err) {
    console.error(`FAIL: ${srcPath} - ${err.message}`);
    return false;
  }
}

async function main() {
  const srcDir = path.resolve(__dirname, DIR);
  const dstDir = srcDir + "-watermarked";

  const files = collectImages(srcDir);
  console.log(`Found ${files.length} images in ${DIR}`);

  if (fs.existsSync(dstDir)) fs.rmSync(dstDir, { recursive: true, force: true });
  fs.mkdirSync(dstDir, { recursive: true });

  let done = 0;
  for (const { full, relPath } of files) {
    const dstPath = path.join(dstDir, relPath);
    const dstFileDir = path.dirname(dstPath);
    if (!fs.existsSync(dstFileDir)) fs.mkdirSync(dstFileDir, { recursive: true });
    const ok = await processFile(full, dstPath);
    if (ok) done++;
    process.stdout.write(`\r${done}/${files.length}`);
  }

  console.log(`\nWatermarked: ${done}/${files.length}`);

  if (done === files.length) {
    const backupDir = srcDir + "-original";
    try { fs.rmSync(backupDir, { recursive: true, force: true }); } catch (_) {}
    fs.renameSync(srcDir, backupDir);
    fs.renameSync(dstDir, srcDir);
    fs.rmSync(backupDir, { recursive: true, force: true });
    console.log("Swapped! Done.");
  }
}

main();

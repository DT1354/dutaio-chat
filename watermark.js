const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const DIRS = [
  "public/assets/artworks-compressed",
  "public/assets/dandelion-app-compressed",
  "public/assets/knowledge-base-compressed",
  "public/assets/photos-compressed",
  "public/assets/jealousy-compressed",
];

// SVG水印模板
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

// 递归收集所有图片文件（保持相对路径）
function collectImages(rootDir) {
  const results = [];
  function walk(dir, rel) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      const relPath = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.isDirectory()) {
        walk(full, relPath);
      } else if (/\.(webp|jpg|jpeg|png)$/i.test(entry.name)) {
        results.push({ full, relPath });
      }
    }
  }
  walk(rootDir, "");
  return results;
}

async function processFile(srcPath, dstPath) {
  try {
    const meta = await sharp(srcPath).metadata();
    const svg = Buffer.from(makeWatermarkSvg(meta.width, meta.height));

    await sharp(srcPath)
      .composite([{ input: svg, gravity: "southeast" }])
      .toFile(dstPath);

    return true;
  } catch (err) {
    console.error(`FAIL: ${srcPath} - ${err.message}`);
    return false;
  }
}

async function main() {
  let total = 0, done = 0;

  // Phase 1: Count all files recursively
  for (const dir of DIRS) {
    const full = path.resolve(__dirname, dir);
    if (!fs.existsSync(full)) continue;
    total += collectImages(full).length;
  }

  console.log(`Found ${total} images to watermark`);

  // Phase 2: Write watermarked to new dirs (preserving subdirectory structure)
  for (const dir of DIRS) {
    const srcDir = path.resolve(__dirname, dir);
    const dstDir = srcDir + "-watermarked";
    if (!fs.existsSync(srcDir)) continue;

    const files = collectImages(srcDir);

    for (const { full: srcPath, relPath } of files) {
      const dstPath = path.join(dstDir, relPath);
      const dstFileDir = path.dirname(dstPath);
      if (!fs.existsSync(dstFileDir)) fs.mkdirSync(dstFileDir, { recursive: true });

      const ok = await processFile(srcPath, dstPath);
      if (ok) done++;
      process.stdout.write(`\r${done}/${total}`);
    }
  }

  console.log(`\nWatermarked: ${done}/${total}`);

  if (done === total) {
    console.log("\nAll done! Swapping directories...");
    for (const dir of DIRS) {
      const srcDir = path.resolve(__dirname, dir);
      const dstDir = srcDir + "-watermarked";
      if (!fs.existsSync(dstDir)) continue;
      const backupDir = srcDir + "-original";
      try {
        fs.renameSync(srcDir, backupDir);
        fs.renameSync(dstDir, srcDir);
        fs.rmSync(backupDir, { recursive: true, force: true });
        console.log(`  Swapped: ${path.basename(dir)}`);
      } catch (err) {
        console.error(`  SWAP FAIL: ${dir} - ${err.message}`);
      }
    }
    console.log("Done!");
  } else {
    console.log(`\n${total - done} files failed.`);
  }
}

main();

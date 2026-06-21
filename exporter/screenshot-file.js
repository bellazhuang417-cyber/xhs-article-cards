/**
 * 截图导出 - 指定 HTML 文件
 * 用法: node exporter/screenshot-file.js [html路径] [输出目录] [前缀名]
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const PAGE_SIZE = { width: 1080, height: 1440 };

async function main() {
  const htmlPath = process.argv[2];
  const outputDir = process.argv[3] || path.dirname(htmlPath);
  const prefix = process.argv[4] || 'page';

  if (!htmlPath) {
    console.error('用法: node screenshot-file.js <html路径> [输出目录] [前缀名]');
    process.exit(1);
  }

  const absPath = path.resolve(htmlPath);
  if (!fs.existsSync(absPath)) {
    console.error(`文件不存在: ${absPath}`);
    process.exit(1);
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: PAGE_SIZE,
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  await page.goto(`file://${absPath}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  const pages = await page.$$('.page');
  if (pages.length === 0) {
    console.error('未找到 .page 元素');
    process.exit(1);
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n📦 正在导出: ${path.basename(absPath)} (${pages.length} 页)`);

  for (let i = 0; i < pages.length; i++) {
    const pageNum = String(i + 1).padStart(2, '0');
    const outputPath = path.join(outputDir, `${prefix}-${pageNum}.png`);
    await pages[i].screenshot({ path: outputPath, type: 'png' });
    console.log(`  ✓ ${prefix}-${pageNum}.png`);
  }

  await browser.close();
  console.log(`✅ 完成，共 ${pages.length} 张图片 → ${outputDir}`);
}

main().catch(err => {
  console.error('截图失败:', err);
  process.exit(1);
});

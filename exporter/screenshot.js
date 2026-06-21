/**
 * 截图导出工具
 * 将 HTML 模板中的每个 .page 元素截图为 PNG
 *
 * 用法:
 *   node exporter/screenshot.js [模板名] [输出目录]
 *   node exporter/screenshot.js              # 导出全部三套
 *   node exporter/screenshot.js editorial    # 只导出编辑风
 *   node exporter/screenshot.js all custom-output  # 导出全部到指定目录
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const TEMPLATES = ['editorial', 'handdrawn', 'knowledge'];
const PAGE_SIZE = { width: 1080, height: 1440 };

async function screenshotTemplate(browser, templateName, outputBase) {
  const context = await browser.newContext({
    viewport: PAGE_SIZE,
    deviceScaleFactor: 2, // 2x 高清，适配小红书
  });
  const page = await context.newPage();

  const htmlPath = path.resolve(__dirname, `../templates/${templateName}/template.html`);
  if (!fs.existsSync(htmlPath)) {
    console.error(`✗ 模板文件不存在: ${htmlPath}`);
    await context.close();
    return;
  }

  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
  // 等待字体和渲染稳定
  await page.waitForTimeout(800);

  const pages = await page.$$('.page');
  if (pages.length === 0) {
    console.error(`✗ 未找到 .page 元素: ${templateName}`);
    await context.close();
    return;
  }

  const outputDir = path.resolve(outputBase, templateName);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`\n📦 正在导出: ${templateName} (${pages.length} 页)`);

  for (let i = 0; i < pages.length; i++) {
    const pageNum = String(i + 1).padStart(2, '0');
    const outputPath = path.join(outputDir, `${templateName}-${pageNum}.png`);
    await pages[i].screenshot({ path: outputPath, type: 'png' });
    console.log(`  ✓ ${templateName}-${pageNum}.png`);
  }

  await context.close();
  console.log(`✅ ${templateName} 完成 → ${outputDir}`);
  return pages.length;
}

async function main() {
  const templateArg = process.argv[2] || 'all';
  const outputArg = process.argv[3] || path.resolve(__dirname, '../output');

  const targets = templateArg === 'all' ? TEMPLATES : [templateArg];

  const browser = await chromium.launch();

  let total = 0;
  for (const t of targets) {
    if (!TEMPLATES.includes(t)) {
      console.error(`✗ 未知模板: ${t}（可选: ${TEMPLATES.join(', ')}）`);
      continue;
    }
    const count = await screenshotTemplate(browser, t, outputArg);
    total += count || 0;
  }

  await browser.close();
  console.log(`\n🎉 全部完成，共导出 ${total} 张图片`);
}

main().catch(err => {
  console.error('截图失败:', err);
  process.exit(1);
});

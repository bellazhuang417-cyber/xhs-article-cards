# 小红书文章卡片生成器

## 核心定位

把任意文章/Markdown 转成小红书 3:4 竖版可视化卡片图（PNG）。不是做 PPT，而是把长文拆成可滚动的精美图片集。

每篇文章产出 4-8 张 3:4 卡片（1080x1440 设计，2160x2880 导出），包含：封面、正文、要点、金句、结尾。封面和可选页面配 AI 生成的插画。

## 能力架构（复刻自 ian-xiaohei-illustrations）

```
文章输入
  ↓
① 消化正文 → 提炼认知锚点
  ↓
② 拆页策略 → 把文章拆成 N 页卡片
  ↓
③ 配图策略 → 哪些页需要插画，配什么
  ↓
④ 生成配图 → ImageGen（3:4 竖版）
  ↓
⑤ 填充 HTML 模板 → 选择版式
  ↓
⑥ Playwright 截图 → 导出 PNG
  ↓
⑦ QA 检查 → 失败信号检测 + 迭代
```

## 先读这些参考

按任务需要读取，不要一次塞满上下文：

- `references/page-types.md`：6 种页面版式定义和选用规则。
- `references/split-strategy.md`：拆页策略——如何把文章拆成卡片。
- `references/illustration-guide.md`：配图指南——风格 DNA、IP 用法、构图模式。
- `references/prompt-template.md`：3:4 竖版生图 prompt 模板。
- `references/qa-checklist.md`：生成后检查和迭代规则。

## 工作流

### 0. 首次使用：IP 设计（新用户必做）

**首次触发 skill 时，必须先完成这一步。** 如果用户已经有 IP 定稿图，跳到 Step 1。

问用户三个问题：

**① 要不要为你设计一套专属 IP 形象？**

IP 是你卡片上的"视觉签名"，让读者一眼认出是你。类似 ian-xiaohei-illustrations 的"小黑"，每个用户可以有自己的角色。

如果用户选择「要」，继续：

**② 你想象中的 IP 是什么样的？**

收集以下信息：
- 角色：人物 / 动物 / 抽象形象 / 其他
- 外貌特征：发型、眼睛、表情、体型、标志性元素
- 风格偏好：极简手绘 / 可爱卡通 / 赛博朋克 / 其他
- 常见动作：看书 / 喝咖啡 / 工作 / 旅行 / 思考 / 其他
- 氛围关键词：3-5 个词描述感觉

**③ 收集用户基本信息**

同时收集（用于卡片签名栏）：
- **用户名字**：显示在每页左下角 `sig-name` 位置（如 "Bella"、"小明"、"Alex"）
- **签名 tagline**：一句话个人标语（如 "咖啡 · 阅读 · AI · 生活"）

**④ 生成 IP 定稿图**

用 `ImageGen` 为用户生成 2-3 张不同动作的 IP 定稿图（3:4 竖版），覆盖常见场景。生成后让用户挑选最满意的，保存到用户的 skill 目录：

```
~/.workbuddy/skills/xhs-article-cards/templates/handdrawn/
  ├── template.html        # HTML 模板
  ├── ip-01.png            # 定稿图：动作 A
  ├── ip-02.png            # 定稿图：动作 B
  └── ip-03.png            # 定稿图：动作 C（可选）
```

同时把用户名字和 tagline 写入 `user-config.json`：

```json
{
  "name": "用户名字",
  "tagline": "签名 tagline",
  "ip_images": ["ip-01.png", "ip-02.png"]
}
```

后续所有卡片都优先使用这套定稿图 + 用户配置。

如果用户选择「不要」或已有定稿图，直接进入 Step 1。但**用户名字必须收集**——不能默认写 "Bella"。

### 1. 消化正文

先读用户给的文章/Markdown/链接。提炼：

- **文章标题**（必须提取，用于每页底部签名栏 `sig-sub`）
- 核心观点是什么
- 文章有几个自然段落/小节
- 哪些是认知锚点（核心判断、转折、对比、方法论）
- 哪些适合纯文字，哪些适合配图
- 有没有金句值得单独成页

### 2. 拆页策略

根据文章长度和结构，拆成 4-8 页。参考 `references/split-strategy.md`。

默认结构：
- P1 封面（必须有）
- P2-P(N-1) 正文/要点/金句（按内容分配）
- P(N) 结尾（必须有）

先输出拆页方案（shot list），每页写清楚：
- 页码
- 版式类型（cover/chapter/body/points/quote/ending）
- 标题/副标题
- 内容摘要
- 是否需要配图

### 3. 配图策略

不是每页都要配图。配图优先级：
- 封面页：必须有配图（1 张）
- 章节页：可选
- 正文页：一般不配图
- 要点页：不配图
- 金句页：不配图
- 结尾页：可选

如果用户已有 IP 定稿图（如 Bella IP），优先用定稿图做封面。如果没有，用 ImageGen 生成。

### 4. 生成配图

如果需要生成插画，用内置 `ImageGen` 工具。每张单独生成，3:4 竖版。prompt 模板见 `references/prompt-template.md`。

**绝对不要用 SVG path 硬画人物/复杂插画。** 插画方案优先级：① 已有定稿图 ② ImageGen 生成 ③ 纯文字排版不加图。

#### 📸 杂志风封面插画 · 生图风格规范（Style Spec）

每篇文章的封面需要 4 张插画，**主体内容随文章变化**，但【生图风格】固定如下，确保 4 张图视觉一致：

```
[STYLE PREFIX - 固定，每次必带]
Bold thick black ink pen sketch, consistent thick stroke weight
throughout, centered composition.

[SUBJECT] ← 这里填入该篇文章的具体主体描述

[STYLE SUFFIX - 固定，每次必带]
Minimalist, lots of white space, pure white background, hand-drawn
style, no color no shading no fill, clean and simple, only essential
lines. The entire drawing centered in the frame.
```

**输出参数：** `quality=high, size=1024x1024`
**叠加方式：** 模板中用 `mix-blend-mode:multiply` 叠加在彩色底块上（白色变透明，保留底色）
**底色配色（可按文章调色，保持低饱和柔和色）：**
- 奶油 `#F5EFE6` / 灰蓝 `#94A3B8` / 薰衣草紫 `#E0DCE8` / 暖沙 `#D4B896`

### 5. 填充 HTML 模板

**八种风格模板可选：**

| # | 风格 | 路径 | 特点 |
|---|------|------|------|
| 1 | 手绘人文风 | `templates/handdrawn/template.html` | 方格纸底 + 手绘边框 + 手札体（默认推荐） |
| 2 | 极简编辑风 | `templates/editorial/template.html` | 杂志排版 + 宋体标题 + 极简线条 |
| 3 | 知识卡片风 | `templates/knowledge/template.html` | 白底 + 彩色标签 + 结构化卡片 |
| 4 | 插画波普风 | `templates/pop/template.html` | 黄底半调网点 + 粗体横幅 + 倾斜卡片 |
| 5 | 极简冲击风 | `templates/impact/template.html` | 白底 + 超大标题 + 绿色 CTA + 极简留白 |
| 6 | 日系杂志风 | `templates/magazine/template.html` | 暖白底 + Grid 散落布局 + 衬线标题 + multiply 插画 |
| 7 | 拼贴 Collage 风 | `templates/collage/template.html` | 青色底 + 黑白照片剪贴 + 橙色粗框 + 洋红色块 |
| 8 | 白板 Whiteboard 风 | `templates/whiteboard/template.html` | 米白纸底 + 手绘框线 + 橙色箭头 + 草图图标 |

用户可在 Step 0 选择默认风格，或每次生成时指定。

6 种版式对应的 CSS class：
- `.page.cover` - 封面页
- `.page.chapter` - 章节页（大章节号）
- `.page.body-text-page` / `.page.content` - 正文页（长文排版）
- `.page` + `.points-list` / `.point-cards` - 要点页（编号卡片）
- `.page.quote` - 金句页（引用框）
- `.page.ending` - 结尾页（总结签名）

**必须动态填充的占位符（不能写死）：**

| 占位符 | 说明 | 出现位置 |
|--------|------|---------|
| `{{user_name}}` | 用户名字（来自 `user-config.json`） | 签名栏、封面作者、结尾签名 |
| `{{article_title}}` | 当前文章标题（Step 1 提取） | 每页底部副标题、页眉 brand |
| `{{tagline}}` | 个人标语（来自 `user-config.json`） | 签名栏副标题、结尾 tagline |
| `{{date}}` | 当前日期 | 封面日期 |
| `{{initial}}` | 名字首字母 | 头像圆圈 |
| `{{cover_image}}` | 封面插画路径 | 封面 img src（仅 handdrawn） |
| `{{tag_label}}` | 顶部标签文字 | 封面标签 |

**⚠️ 绝对不能写死任何人的名字。** 每个用户的卡片必须是自己的名字和自己的文章标题。

### 6. 截图导出

用 Playwright 截图。导出工具在 `exporter/screenshot-file.js`。

```bash
NODE_PATH=<workspace>/node_modules node exporter/screenshot-file.js <html路径> <输出目录> <前缀>
```

导出 2x 高清 PNG（2160x2880），适配小红书上传。

### 7. QA 检查

生成后检查 `references/qa-checklist.md`。常见问题：
- 中文乱码（HTML 编码不是 UTF-8）
- 图片不显示（路径错误）
- 文字溢出（内容太多塞不下一页）
- 配图车祸（SVG 硬画人物 → 换 ImageGen）
- **签名栏写死了某个名字**（必须用用户自己的名字）
- **底部标题不是当前文章标题**（必须动态填充）

## 输出口径

拆页策略要短而准。最终交付包含：
- 生成了几张卡片
- 每张卡片的版式和内容
- 配图说明（用了定稿图还是生成的）
- 保存路径
- 可以上传小红书了

## 默认配置

- 比例：3:4（1080x1440 设计，2160x2880 导出）
- **八种风格可选：**
  - 手绘人文风（handdrawn）：方格纸底 + 手绘边框 + 全局手札体（Hannotate SC）— 默认推荐
  - 极简编辑风（editorial）：杂志排版 + 宋体标题 + 极简线条
  - 知识卡片风（knowledge）：白底 + 彩色标签 + 结构化卡片
  - 插画波普风（pop）：黄底半调网点 + 粗体横幅 + 倾斜卡片
  - 极简冲击风（impact）：白底 + 超大标题 + 绿色 CTA + 极简留白
  - 日系杂志风（magazine）：暖白底 + Grid 散落布局 + 衬线标题 + multiply 插画
  - 拼贴 Collage 风（collage）：青色底 + 黑白照片剪贴 + 橙色粗框 + 洋红色块
  - 白板 Whiteboard 风（whiteboard）：米白纸底 + 手绘框线 + 橙色箭头 + 草图图标
- **默认 IP：无（新用户首次使用时引导设计）**
- 模板自带示例 IP 图（`templates/handdrawn/` 下的两张 sample），仅作风格参考，使用者应替换为自己的 IP
- **默认作者名：无（必须从用户收集，不能写死）**
- **默认签名 tagline：无（必须从用户收集）**
- 文章标题：每篇文章动态提取，填入 `{{article_title}}`
- 示例文章：模板均使用"阅读是认知的复利"作为演示内容

**IP 是核心差异化能力。** 每个用户的卡片都应该有自己独一无二的视觉 IP + 自己的名字。Skill 的价值不只是"帮你排版"，而是"帮你建立可识别的视觉品牌"。

## 触发词

小红书卡片、文章卡片、文章可视化、把文章转成图片、xhs article cards、文章拆页、可视化文稿

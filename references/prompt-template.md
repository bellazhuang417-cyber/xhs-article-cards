# 生图 prompt 模板

每张配图单独生成。根据文章内容替换变量。

## ⚠️ 比例硬约束

- **封面图：1024x1024 正方形**（ImageGen 的 size 参数用 "1024x1024"）
- 原因：封面 `.cover-illu` 是 420px 宽的正方形容器，3:4 长方形会撑破或留白
- prompt 里要写 "Square 1:1 aspect ratio"，不要写 "3:4 vertical"

## ⚠️ IP 特征约束（生图前必读）

**生图前必须先读取 `ip-constraints.md`（skill 根目录）。** 这个文件记录了该用户 IP 的固定特征。

把 `ip-constraints.md` 里的特征转成 prompt 里的硬约束段落，用三重锁死法：

```text
CRITICAL RULES FOR {特征名} (non-negotiable):
- {正描述，如：Hair MUST be short bob, ending at jawline/chin}
- {否定式 1，如：Hair MUST NOT reach shoulders}
- {否定式 2，如：Hair MUST NOT be long flowing hair}
- {兜底，如：When unsure, make it SHORTER rather than longer}
- {正参照，如：Reference: Japanese bob haircut / French girl bob}
```

**skill 本身不硬编码任何用户的具体特征。** 每个用户的 IP 约束不同，都从各自的 `ip-constraints.md` 动态读取。

## ⚠️ 生图后处理（必须执行）

ImageGen 输出常带两层多余内容，必须用 PIL 裁掉：

```python
from PIL import Image
img = Image.open('生成图.png')
W, H = img.size
# 扫描亮度 > 235 的区域为白底内容区
# 裁掉四周灰边（约 150-170px）+ 底部水印条（约 100-150px）
# 保存覆盖原文件
```

不裁剪 → 封面会出现"三层灰框"问题（模板手绘边框 + 图片灰边 + 水印条）。

---

## 封面场景图 prompt

```text
Generate one standalone SQUARE illustration for a Chinese article cover card.

Visual DNA:
Pure white background. Minimalist thin ink pen sketch style. Slightly wobbly hand-drawn lines. Lots of empty white space. Clean, natural, premium feeling. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute cartoon, no children's illustration.

Character:
{人物描述——从 ip-constraints.md 提取固定特征 + 本次动作，如：a young woman with SHORT BOB HAIR (ending at jawline), soft air bangs, round eyes, heart-shaped face, resting chin on hand in thinking pose}
The character should be doing an action related to the article theme, not standing still. Character occupies 40-60% of the canvas.

{CRITICAL RULES 段落——从 ip-constraints.md 转换，见上方}

Theme:
{文章主题}

Composition:
{具体画面：人物在哪里、正在做什么、主要物件是什么}

Style references:
Thin ink pen sketch on pure white paper. Natural line wobble. Hand-drawn feeling, not perfect vector lines. Minimalist. Lots of white space. A few small hand-drawn decorative elements if needed (stars, wavy lines, small dots).

Constraints:
Square 1:1 aspect ratio. Pure white background. Character doing an action, not posing. Hand-drawn ink sketch style. Do not make it too polished or perfect. Do not add gray background, gradients, or filled color blocks. Keep it clean and airy.
```

## 隐喻图 prompt（可选页面用，正文配图）

```text
Generate one standalone SQUARE illustration for a Chinese article.

Visual DNA:
Pure white background. Minimalist black hand-drawn line art. Slightly wobbly pen lines. Lots of empty white space. Sparse red/orange/blue handwritten Chinese annotations. Clean absurd product-sketch feeling. No gradients, no shadows, no paper texture, no complex background, no commercial vector style, no PPT infographic look, no cute mascot poster, no children's illustration.

Theme:
{正文配图主题}

Core idea:
{这张图要表达的核心意思}

Composition:
{具体画面：主要物件是什么、信息如何流动、隐喻是什么}

Suggested elements:
{元素1} / {元素2} / {元素3}

Chinese handwritten labels:
{标注词1} / {标注词2} / {标注词3}

Color use:
Black for main line art. Orange for main flow/path/arrows. Red only for key warnings/problems. Blue only for secondary notes.

Constraints:
Square 1:1 aspect ratio. One image explains only one core idea. Keep the main subject around 40%-60% of the canvas. Preserve at least 35% blank white space. Use at most 5-8 short handwritten Chinese labels. Do not write a title in the top-left corner. Do not make it a formal diagram or course slide. Invent a fresh visual metaphor for this specific article.
```

## 变量说明

| 变量 | 说明 | 示例 |
|------|------|------|
| {人物描述} | 人物的外貌和动作 | a young woman with air bangs reading a book at a desk |
| {文章主题} | 文章的核心主题 | reading and cognitive growth |
| {具体画面} | 画面的布局和元素 | woman sitting at a desk with an open book, a cup of coffee beside her, soft natural light |
| {正文配图主题} | 配图要表达的概念 | information overload vs focused reading |
| {核心意思} | 这张图的认知点 | reading is not information collection, it's cognitive resonance |
| {元素} | 画面中的物件 | book / coffee cup / desk / window |
| {标注词} | 手写中文标注 | 输入 / 过滤 / 共振 |

## 图像编辑 prompt

去掉多余文字：

```text
Edit the provided image. Remove only the handwritten text "{要删除的文字}". Fill that area with the same clean white background. Preserve everything else exactly.
```

增强动作感：

```text
Regenerate this illustration with the same core meaning, but make the character more central to the action. The character should be doing the work that explains the idea, not standing beside it. Keep it clean, sparse, hand-drawn, and not cute.
```

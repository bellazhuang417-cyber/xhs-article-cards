# IP 特征约束 — 模板

> 复制此文件为 `ip-constraints.md`，填入你自己的 IP 特征。这是你 IP 的"宪法"——后续所有生图（无论换什么动作/场景）都必须以这些特征为基准，不能偏离。

## 固定特征（每次生图必须遵守）

- **发型**：{具体描述，如：短发 bob，发尾在下巴位置 / 长发披肩 / 马尾 / 其他}
- **脸型**：{如：圆脸 / 心形脸 / 瓜子脸 / 方脸}
- **眼睛**：{如：大圆眼 / 细长眼 / 其他}
- **体型**：{如：纤细 / 中等 / 健壮}
- **风格**：{如：极简手绘线稿 / 水彩 / 其他}
- **其他标志性特征**：{如：戴眼镜 / 有痣 / 特定配饰}

## 生图时的 prompt 硬约束写法

把上述特征转成英文写入 prompt，三重锁死法：

- ✅ 正描述：{如：short bob hair ending at jawline}
- ❌ 否定式：{如：NOT long hair, NOT shoulder-length, NOT flowing hair}
- 🤔 兜底：{如：when unsure, make it SHORTER rather than longer}
- 正参照：{如：Japanese bob haircut / French girl bob}

示例（短发 bob）：

```text
CRITICAL RULES FOR HAIR (non-negotiable):
- Hair MUST be short bob, ending at jawline/chin
- Hair MUST NOT reach shoulders
- Hair MUST NOT be shoulder-length
- Hair MUST NOT be long flowing hair
- When unsure, make it SHORTER rather than longer
- Reference: Japanese bob haircut / French girl bob
```

**为什么用三重锁死：** 光写 "short bob" 不够——模型仍可能生成长发。必须用否定式 + 正参照 + "拿不准就往保守方向调"兜底，才能锁死特征。

## 常见动作库

{列出你的 IP 常见动作，生图时从中选，或根据文章主题发明新动作}

示例：
- 看书
- 喝咖啡
- 旅行（背包走路）
- 思考（托腮）
- 工作（在电脑前）
- 散步

## 定稿图参考

{如果你的 IP 已有定稿图，记录文件名和路径，生图时对照参考}

示例：
- `templates/handdrawn/ip-01.png` — 看书
- `templates/handdrawn/ip-02.png` — 喝咖啡

定稿图是 IP 的"标准像"——生图时如果拿不准特征，对照定稿图。

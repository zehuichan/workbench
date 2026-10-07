---
name: workbench-ui-ux
description: >-
  设计或审查 workbench 里用户可见的界面改动时读取：token 纪律、壳层与录入控件两套栈、复用优先、
  反馈面（ElMessage / 确认框 / 就地提示）、加载态、浮层、间距、明暗双主题。Use when adding,
  changing, or reviewing product-user-visible UI in src/layouts, src/views, src/ui, or src/components.
---

# workbench UI / UX

这份 skill 管判断题，不是清单：反馈出现在哪、复用哪一套控件、浮层在窗口边缘和两种主题下怎么表现。Prettier、`workbench-code-review` 的阻断项、以及 `.agents/skills/shadcn-vue/SKILL.md` 的 class / `cn()` 规则不在这里重复。

## 真源

- `DESIGN.md`：色板、字号阶、间距、品牌标记。唯一彩色强调是 Workbench Teal（`#0b6e6e`；暗色交互文字可用 `#2dd4bf`）。
- `src/styles/tailwind.css`：`:root` 与 `.dark` 的实值。语义色走 `--primary`、`--foreground`、`--muted-foreground` 等；品牌补充是 `--brand`、`--paper`、`--ink-soft`。
- `src/ui/`：已安装的 shadcn-vue 原语（button、input、sidebar、sheet、tooltip、skeleton、separator、navigation-menu）。新增原语走 shadcn-vue CLI，落在 `src/ui/`，不抄进功能目录。
- `.agents/skills/shadcn-vue/SKILL.md`：壳层组件的装、搜、样式规则。

## 两套控件

- **Playground 壳与营销页**（`src/layouts/`、`src/views/home/`、侧栏、顶栏）用 `src/ui/` 与 Tailwind 语义色。不在这里直接铺 Element Plus。
- **录入 demo**（PlusTable、Filters、ERP 单据）的字段控件走 `src/adapter` 里注册的 Element Plus。瞬时结果用已有的 `ElMessage`，需确认的批量改写用 `ElMessageBox`（见 `src/components/demo/use-confirm-dialog.ts`）。不要在旁边再加一套 sonner / toast。

## 视觉基础

- 颜色、圆角、阴影、间距用语义 token 或 `DESIGN.md` 里已有的阶。写字面色值前，先在目标页和最近的同类页里找已在用的 token。
- 每个颜色都要在 `:root` 与 `.dark` 下可读。`ink-muted` / `muted-foreground` 一类弱化色只上装饰面，不上正文。
- 功能字重用 400 / 500。600 只属于 `DESIGN.md` 的标题角色与 `nav-label`。要强调，用字号或墨色。
- 字号取 `DESIGN.md` 的现有角色。同级内容同一字号。正文字体是 Geist Sans；代码用 Geist Mono / IBM Plex Mono；wordmark 用 Sora，不拿来排界面。
- 图标、文字与邻近元素对齐到同一条轴。图标只从 `@lucide/vue` 取语义最贴近的一个。
- 深度靠发丝边和表面抬起。阴影只给浮层（dialog / sheet）。不用紫渐变、霓虹、装饰性卡片堆。

## 复用优先

- 先扩现有组件（多一个菜单项、给现有原语加一个 prop），再并排新元素。
- 壳层图标按钮语义不自明时用 `src/ui/tooltip`。不用 `title` 属性凑。
- 品牌标记按 `DESIGN.md` 的 lockup：方形 teal 底 + 2×2 模块，wordmark 在外面。不旋转、不加描边光、不把字放进方块里。

## 反馈面

按消息寿命相对产生它的面来选：

- **瞬时操作结果用 `ElMessage`**，只报成功与失败，不报进行中。删除或提交失败时，表格行和表单值仍在。
- **需要用户点头的批量改写用 `ElMessageBox`**，文案走 `describeConfirmation` 一类已有摘要，不另写一套确认 UI。
- **就地提示只给这一面自己的状态**：字段校验、查询失败。已有内容旁边放紧凑提示；没有内容才放完整空态。
- **文案白话、短**。demo 可以出现字段名和组件名，因为这是 API 演示；壳层导航和营销文案不堆内部实现词。两句以内的中文提示不加句末句号。提示不挤动邻居。

## 加载态

- 列表用 `src/ui/skeleton` 的 `Skeleton`。其余页面级加载居中放一个指示，不放在页角。
- 一页一种加载处理。没有加载文字，除非这一屏离开文字就不知道在等什么。

## 浮层与滚动条

每个 sheet、popover、tooltip 合并前三项必验：

- **可关闭**：外部点击（可聚焦时加 Escape）关闭。
- **贴边自适应**：留边距，只翻向放得下的一侧。
- **不被裁剪**：逃出 `overflow` 祖先，不被邻近元素盖住。

滚动条留在容器内，不贴死圆角边缘。

## 间距

- 相邻元素沿用该区域已有间距（`DESIGN.md` 的 4 / 8 / 12 / 16 / 24 / 32）。不出现零间距，除非是发丝分割线。
- 平行元素优先对称。一处解释不了的单独偏移，通常是漏用了共享值。

## 验证与报告

- 在 playground 走一遍受影响路由，亮色与 `.dark` 各看一次。
- 用户可感知的界面变化在报告里单独点出，便于决定要不要看截图。

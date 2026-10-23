# AGENTS.md — LAHAI-ROI PROTOCOL (拉海洛方块)

> AI 编码助手参考手册。修改本仓库前请先阅读此文件。

---

## 项目概览

纯前端方块填充益智网页游戏，复刻自 KURO GAMES《鸣潮》中的「拉海洛方块 (LahaiRoi-Protocol)」小游戏。

- **玩法**：8×8 棋盘中拖拽多格方块填满行/列消除得分
- **6 种元素属性**：Glacio(冷凝) / Fusion(热熔) / Electro(导电) / Aero(气动) / Spectro(衍射) / Havoc(湮灭)
- **三档难度**：SIMPLE / STANDARD / CHALLENGE
- **Demo 教学**：5 个内置场景演示
- **最高分**：localStorage 持久化当前历史最高分

**技术栈**：纯静态 HTML5 + CSS3 + Vanilla JS（零依赖）

---

## 目录结构

```
├── AGENTS.md              # ← 本文件（AI 参考手册）
├── README.md              # 项目说明（署名、许可、玩法）
├── index.html             # 入口页面（DOM 结构与事件绑定）
├── css/
│   ├── base.css           # 基础重置、CSS 变量、终端外壳
│   ├── header.css         # 顶部按钮、标题、分数、难度
│   ├── board.css          # 棋盘、格子、托盘、方块
│   ├── overlays.css       # Toast、游戏结束、消除动画
│   ├── tutorial.css       # Demo 教学界面
│   └── responsive.css     # 响应式断点（最后加载）
├── js/
│   ├── config.js          # 常量、方块形状定义、难度参数
│   ├── state.js           # 运行时状态 + 最高分（localStorage）
│   ├── logic.js           # 纯函数：棋盘碰撞检测、权重计算
│   ├── elements.js        # 共享 DOM 引用、拖拽状态、窗口缩放处理
│   ├── render.js          # DOM 渲染：方块绘制、高亮提示、分数显示
│   ├── drag.js            # 鼠标/触屏拖放系统
│   ├── board.js           # 棋盘初始化、方块生成、放置、消除、计分
│   ├── tutorial.js        # Demo 教学场景数据与自动播放
│   ├── fullscreen.js      # 全屏切换与状态同步
│   ├── ui.js              # DOM 绑定、事件监听、难度切换
│   └── game.js            # 入口：DOMContentLoaded → initGame()
├── img/
│   └── attribute/         # 6 种元素属性 SVG 图标
│       ├── Aero.svg
│       ├── Electro.svg
│       ├── Fusion.svg
│       ├── Glacio.svg
│       ├── Havoc.svg
│       └── Spectro.svg
└── server/                # 静态服务器（Caddy 可执行文件）
    ├── caddy.exe
    ├── start.cmd
    ├── LICENSE
    └── README.md
```

---

## 关键文件职责

### `index.html`
- 全部 DOM 结构：棋盘、托盘、游戏结束遮罩、Demo 覆盖层
- `<link>` 加载顺序固定：base → header → board → overlays → tutorial → responsive
- `<script>` 加载顺序固定：config → state → logic → elements → render → drag → board → tutorial → fullscreen → ui → game
- 页脚署名（KURO GAMES → 蒲公桜 → CD_Mking）

### `css/*.css`
- `base.css`：重置、`:root` 变量、`.game-terminal`、终端容器、页脚、属性图标
- `header.css`：帮助/全屏按钮、标题、分数、难度选择
- `board.css`：游戏区、棋盘、格子状态、托盘、拖拽方块
- `overlays.css`：Toast、游戏结束遮罩、消除动画
- `tutorial.css`：Demo 覆盖层、面板、导航、播放按钮、拖拽幽灵
- `responsive.css`：全部 `@media` 断点，必须最后加载以覆盖基础样式

### `js/config.js`
- `CONFIG` 对象：棋盘大小、格子尺寸、计分常量
- `ATTRIBUTES`：6 种元素定义（id + SVG icon HTML）
- `SHAPES_ALL`：24 种方块形状（二维 0/1 矩阵）
- `DIFFICULTY_CONFIG`：三档难度倍率
- `recalcLayout()`：根据窗口尺寸动态计算格子大小

### `js/state.js`
- `state` 对象：棋盘、当前分数、历史最高分、难度、Demo 模式、可用方块、游戏结束标志

### `js/logic.js`
- `canPlaceShape(matrix, startX, startY)`：方块能否放置
- `countPlacements(matrix)`：某方块在棋盘上合法放置数
- `getShapeWeight(placements, area, difficulty)`：根据难度生成生成权重

### `js/render.js`
- DOM 渲染函数：方块绘制、高亮、当前分数/最高分显示
- `renderShapeInSlot(shapeData, slotIndex)`：在托盘槽中渲染形状
- `loadHighScore()` / `saveHighScore()`：最高分 localStorage 读写与旧数据迁移
- `showToast(message)`：底部提示消息

### `js/elements.js`
- 全局 DOM 引用：`boardEl`、`traySlots`、按钮、Toast
- 拖拽状态：`draggedElement`、`draggedShapeData`、`draggedSlotIndex` 等
- `onResize()`：窗口尺寸变化后重算布局并重绘托盘

### `js/drag.js`
- 拖放系统：`onDragStart/Move/End`（鼠标 + 触屏）
- `getBoardCoordinates()`：将指针坐标换算为棋盘坐标

### `js/board.js`
- 游戏初始化：`init()`、`fillTray()` 填充方块
- 棋盘操作：`placeShape()`、`checkLines()`、`checkGameOver()`
- 计分：`addScore()`，处理难度倍率；当前分数超过最高分时立即持久化（Demo 模式除外）

### `js/tutorial.js`
- Demo 教学系统：`DEMO_SCENES`（5 个场景）、`applyScene()`、`playScene()`
- 场景动画：`animateShapeToBoard()`、`fillBoardForScene()`
- 开关演示：`openDemo()`、`closeDemo()`

### `js/fullscreen.js`
- 全屏能力检测、进入/退出全屏、按钮状态同步

### `js/ui.js`
- `initGame()`：获取 DOM 引用并绑定所有事件
- Demo 导航、重启、全屏与窗口缩放事件
- `setDifficulty()`：难度切换与按钮状态同步

### `js/game.js`
- 入口文件：监听 `DOMContentLoaded` 并调用 `initGame()`

---

## 数据流

```
用户拖拽方块
  → onDragStart (drag.js)
    → onDragMove + highlightBoard (render.js)
      → onDragEnd (drag.js)
        → canPlaceShape? (logic.js)
          → placeShape + addScore (board.js)
            → checkLines (board.js)
              → fillTray (board.js) — 自适应权重生成
                → checkGameOver (board.js)
```

### 状态存储
- localStorage key: `lahairoi_v3_highscore`
- 格式：`{ highScore: number }`
- 启动时若检测到旧 key `lahairoi_v3_leaderboard`，会迁移其中的最高分并删除旧数据

---

## 计分规则

| 事件 | 分值 | 备注 |
|------|------|------|
| 放置一个格子 | `SCORE_BLOCK` (10) × 格子数 | 乘难度倍率 |
| 消除一行/一列 | `SCORE_LINE` (100) | 乘难度倍率 |
| 多行/多列同时消除 | 额外 `(lines-1) × SCORE_MULTI_MULTIPLIER` (50) | 乘难度倍率 |

难度倍率：SIMPLE=0.7, STANDARD=1.0, CHALLENGE=1.5

---

## 自适应方块生成算法

`fillTray()` 根据棋盘实时空位计算权重：
1. 遍历所有 24 种形状，调用 `countPlacements()` 统计合法放置数
2. 按难度调用 `getShapeWeight()` 计算权重
   - **SIMPLE**：`p²/area` — 倾向小块、高放置数
   - **STANDARD**：`p` — 线性权重
   - **CHALLENGE**：`p^0.3 × area` — 倾向大块、低放置数
3. 按权重随机选取，确保总有可用方块

---

## 构建与运行

```bash
# 无构建步骤，直接打开
start index.html

# 或使用任意静态服务器
python -m http.server 8080
npx serve .
```

---

## 编码约定

### 语言与风格
- **JavaScript**：ES5（var 声明、function 表达式），无 import/export
- **CSS**：CSS 变量 + Flexbox/Grid，移动端响应式（@media 断点 899px / 480px / 600px / 400px）
- 所有 JS 文件在 HTML 中用 `<script>` 顺序加载，共享全局变量

### 命名
- `var` / `function` 全小驼峰（camelCase）
- 常量全大写下划线（`SCORE_LINE`）
- CSS class 短横线（`diff-btn`、`attr-glacio-bg`）
- DOM id 小驼峰（`currentScore`、`highScore`）

### 全局变量
所有文件共享以下顶层全局变量：
- `CONFIG`, `ATTRIBUTES`, `SHAPES_ALL`, `DIFFICULTY_CONFIG`, `TRAY_CELL_SIZE`, `TRAY_CELL_RATIO` (config.js)
- `state` (state.js)
- `boardEl`, `traySlots`, `draggedElement`, 等 DOM 引用与拖拽状态 (elements.js)
- `onDragStart` / `onDragEnd` (drag.js)
- `init`, `fillTray`, `placeShape`, `checkLines`, `checkGameOver`, `addScore` (board.js)
- `DEMO_SCENES`, `applyScene`, `playScene` 等教学函数 (tutorial.js)
- `renderShapeInSlot`, `showToast`, `highlightBoard` 等渲染函数 (render.js)
- `initGame`, `setDifficulty` (ui.js)

### CSS 变量
```css
--bg-color, --bg-gradient, --grid-line, --cell-empty
--attr-glacio / --attr-fusion / --attr-electro / --attr-aero / --attr-spectro / --attr-havoc
--accent-color, --danger-color, --text-color
--cell-size, --grid-gap, --board-size
```

---

## 常见修改场景

### 添加新方块形状
在 `config.js` 的 `SHAPES_ALL` 数组末尾追加新的二维矩阵即可（自动参与权重计算）。

### 增加新难度
1. `config.js` 的 `DIFFICULTY_CONFIG` 添加新条目
2. 在 `index.html` 的 `.difficulty-selector` 中添加对应 `<button>`
3. 难度切换逻辑在 `ui.js` 的 `setDifficulty()` 中自动处理

### 修改 Demo 场景
编辑 `tutorial.js` 中 `DEMO_SCENES` 数组：
- `fills`：预先填充的单元格坐标
- `except`：（当 fills=null 时）留空坐标
- `shapeMatrix`：演示用方块
- `target`：放置目标坐标
- `desc`：描述文字

### 修改最高分存储结构
1. 更新 `render.js` 的 `HIGH_SCORE_KEY` 与 `loadHighScore()` / `saveHighScoreValue()`
2. 如需兼容旧格式，同步更新 `loadHighScore()` 的迁移逻辑

---

## 已知约束

- 禁用手势缩放（`touch-action: none`）
- 无后端，纯 localStorage 存储（上限 ~5MB）
- 触屏拖放依赖 `touch` 事件，`passive: false`
- 浏览器需支持 CSS Grid / CSS Variables
- 所有图片为内联 SVG（无外部依赖）

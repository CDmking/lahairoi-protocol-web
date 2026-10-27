# AGENTS.md — LAHAI-ROI PROTOCOL (拉海洛方块)

> AI 编码助手参考手册。修改本仓库前请先阅读此文件。

---

## 项目概览

纯前端方块填充益智网页游戏，复刻自 KURO GAMES《鸣潮》中的「拉海洛方块 (LahaiRoi-Protocol)」小游戏。

- **玩法**：8×8 棋盘中拖拽多格方块填满行/列消除得分
- **6 种元素属性**：Glacio(冷凝) / Fusion(热熔) / Electro(导电) / Aero(气动) / Spectro(衍射) / Havoc(湮灭)
- **三档难度**：SIMPLE / STANDARD / CHALLENGE
- **Demo 教学**：5 个内置场景演示
- **最高分**：localStorage 持久化当前历史最高分，支持手动清除

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
├── audios/
│   └── BGM.mp3            # 循环背景音乐
├── js/
│   ├── shapes.js          # 方块形状数据（32 种）
│   ├── config.js          # 常量、难度参数
│   ├── state.js           # 运行时状态 + 最高分（localStorage）
│   ├── logic.js           # 纯函数：棋盘碰撞检测、权重计算
│   ├── elements.js        # 共享 DOM 引用、拖拽状态、窗口缩放处理
│   ├── render.js          # DOM 渲染：方块绘制、高亮提示、分数显示
│   ├── drag.js            # 鼠标/触屏拖放系统
│   ├── board.js           # 棋盘初始化、方块生成、放置、消除、计分
│   ├── tutorial.js        # Demo 教学场景数据与自动播放
│   ├── fullscreen.js      # 全屏切换与状态同步
│   ├── audio.js           # 背景音乐播放与静音控制
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
- `<script>` 加载顺序固定：shapes → config → state → logic → elements → render → drag → board → tutorial → fullscreen → audio → ui → game
- 页脚署名（KURO GAMES → 蒲公桜 → CD_Mking）

### `css/*.css`
- `base.css`：重置、`:root` 变量、`.game-terminal`、终端容器、页脚、属性图标
- `header.css`：帮助/全屏/音乐按钮、标题、分数、难度选择
- `board.css`：游戏区、棋盘、格子状态、托盘、拖拽方块
- `overlays.css`：Toast、游戏结束遮罩、消除动画
- `tutorial.css`：Demo 覆盖层、面板、导航、播放按钮、拖拽幽灵
- `responsive.css`：全部 `@media` 断点，必须最后加载以覆盖基础样式

### `js/shapes.js`
- `SHAPES_DATA`：方块形状唯一数据源（含 id / rows / cols / matrix）
- `SHAPES_ALL`：从 `SHAPES_DATA.shapes` 提取的 32 种二维 0/1 矩阵

### `js/config.js`
- `CONFIG` 对象：棋盘大小、格子尺寸、计分常量与连击倍率
- `ATTRIBUTES`：6 种元素定义（id + SVG icon HTML）
- `DIFFICULTY_CONFIG`：三档难度倍率
- `recalcLayout()`：根据窗口尺寸动态计算格子大小

### `js/state.js`
- `state` 对象：棋盘、当前分数、历史最高分、连击数、难度、Demo 模式、可用方块、游戏结束标志

### `js/logic.js`
- `canPlaceShape(matrix, startX, startY)`：方块能否放置
- `countPlacements(matrix)`：某方块在棋盘上合法放置数
- `getShapePlacements(matrix)`：返回所有合法放置位置的 64 位位图列表
- `placementsOverlap(a, b)`：判断两个放置位图是否重叠
- `canPlaceAllThree(listA, listB, listC)`：判断 3 个方块能否同时放入当前空位
- `getShapeWeight(placements, area, difficulty)`：根据难度生成生成权重
- `getLineBaseScore(lines)`：按 `100 × lines² + 100` 计算消除基础分
- `getComboMultiplier(combo)`：按 1.0 / 1.2 / 1.3 / 1.5 计算连击倍率
- `getLineClearScore(lines, combo)`：基础分 × 连击倍率

### `js/render.js`
- DOM 渲染函数：方块绘制、高亮、当前分数/最高分显示
- `renderShapeInSlot(shapeData, slotIndex)`：在托盘槽中渲染形状
- `loadHighScore()` / `saveHighScore()`：最高分 localStorage 读写与旧数据迁移
- `clearHighScore()`：重置 `state.highScore` 并删除本地最高分记录
- `updateHighScoreDisplay()`：更新最高分显示，并同步清除按钮的禁用状态
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
- 计分：`checkLines()` 统计完整行/列，更新连击并调用 `addScore()`；`addScore()` 处理难度倍率，当前分数超过最高分时立即持久化（Demo 模式除外）

### `js/tutorial.js`
- Demo 教学系统：`DEMO_SCENES`（5 个场景）、`applyScene()`、`playScene()`
- 场景动画：`animateShapeToBoard()`、`fillBoardForScene()`
- 开关演示：`openDemo()`、`closeDemo()`

### `js/fullscreen.js`
- 全屏能力检测、进入/退出全屏、按钮状态同步

### `js/audio.js`
- `initBgm()`：初始化循环背景音乐、读取静音状态、绑定音乐按钮
- `tryPlayBgm()`：尝试播放；自动播放被浏览器拦截时，在用户首次交互后补播
- `updateMusicBtn()`：同步音乐按钮图标、`title`、`aria-label` 与静音状态
- 静音状态存储 key：`lahairoi_v3_bgm_muted`

### `js/ui.js`
- `initGame()`：获取 DOM 引用并绑定所有事件
- Demo 导航、重启、全屏、清除最高分与窗口缩放事件
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
          → placeShape (board.js)
            → checkLines + addScore (board.js)
              → fillTray (board.js) — 自适应权重生成
                → checkGameOver (board.js)
```

### 状态存储
- localStorage key: `lahairoi_v3_highscore`
- 格式：`{ highScore: number }`
- 启动时若检测到旧 key `lahairoi_v3_leaderboard`，会迁移其中的最高分并删除旧数据

---

## 计分规则

- 放置方块本身不得分。
- 一行或一列计为 1line；完整行数 + 完整列数即为本次消除的 `lines`，交叉点不重复计数。
- 基础分：`100 × lines² + 100`
  - 1line = 200，2line = 500，3line = 1000，4line = 1700
- 连击倍率：第 1 次 1.0，第 2 次 1.2，第 3 次 1.3，第 4 次及以上 1.5
- 消除分：`基础分 × 连击倍率`
- 一次放置无论同时消除几行，只增加 1 次连击；放置后未消除则连击归零。
- 重启、切换难度、进入 Demo 时连击归零。
- 难度倍率仍生效：SIMPLE=0.7, STANDARD=1.0, CHALLENGE=1.5，最终得分向下取整。

| 同时消除 | 第1次 | 第2次 | 第3次 | 第4次+ |
|---------|-------|-------|-------|--------|
| 1line | 200 | 240 | 260 | 300 |
| 2line | 500 | 600 | 650 | 750 |
| 3line | 1000 | 1200 | 1300 | 1500 |
| 4line | 1700 | 2040 | 2210 | 2550 |

---

## 自适应方块生成算法

`fillTray()` 保证每批 3 个方块都能同时放入当前空位（忽略放置过程中的行列消除）：

1. 遍历所有 32 种形状，用 `getShapePlacements()` 获取当前合法放置位置
   - 过滤掉 `placements === 0` 的形状
   - `p = placements + 1`，`area` 为方块占用的格子数
2. 按难度调用 `getShapeWeight()` 计算单个形状权重
   - **SIMPLE**：`p²/area` — 倾向小块、高放置数
   - **STANDARD**：`p` — 线性权重
   - **CHALLENGE**：`p^0.3 × area` — 倾向大块、低放置数
3. 枚举所有无序组合 `a ≤ b ≤ c`（允许重复），用 `canPlaceAllThree()` 判断联合可放置
4. 组合权重取三个形状权重的几何平均，再乘以该组合的排列数（1/3/6）
   - 概率模型等价于 `N³` 有序三元组（`N` 为当前可放置形状数，最大 32）
5. 按组合总权重随机抽取，再将选中的 3 个形状随机分配到托盘槽位
6. 元素属性仍独立随机；棋盘空位少于 3 个时不存在合法组合，直接判定游戏结束

最多进行 `C(34, 3) = 5984` 次联合可放置判定；通过乘以排列数计入顺序，避免 `32³ = 32768` 次重复判定。

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
- 常量全大写下划线（`SCORE_LINE_UNIT`）
- CSS class 短横线（`diff-btn`、`attr-glacio-bg`）
- DOM id 小驼峰（`currentScore`、`highScore`）

### 全局变量
所有文件共享以下顶层全局变量：
- `SHAPES_DATA`, `SHAPES_ALL` (shapes.js)
- `CONFIG`, `ATTRIBUTES`, `DIFFICULTY_CONFIG`, `TRAY_CELL_SIZE`, `TRAY_CELL_RATIO` (config.js)
- `state` (state.js)
- `boardEl`, `traySlots`, `draggedElement`, 等 DOM 引用与拖拽状态 (elements.js)
- `onDragStart` / `onDragEnd` (drag.js)
- `canPlaceShape`, `getShapePlacements`, `placementsOverlap`, `canPlaceAllThree`, `getShapeWeight` (logic.js)
- `getLineBaseScore`, `getComboMultiplier`, `getLineClearScore` (logic.js)
- `init`, `fillTray`, `placeShape`, `checkLines`, `checkGameOver`, `addScore` (board.js)
- `DEMO_SCENES`, `applyScene`, `playScene` 等教学函数 (tutorial.js)
- `renderShapeInSlot`, `showToast`, `highlightBoard` 等渲染函数 (render.js)
- `initBgm`, `tryPlayBgm`, `updateMusicBtn` (audio.js)
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
在 `shapes.js` 的 `SHAPES_DATA.shapes` 数组末尾追加 `{ id, rows, cols, matrix }`，并更新 `shapeCount`。

### 更换背景音乐
替换 `audios/BGM.mp3`（保持文件名），或在 `index.html` 的 `<audio id="bgm">` 中修改 `src` 路径。默认音量在 `audio.js` 的 `BGM_VOLUME` 中调整。

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
2. 同步检查 `clearHighScore()` 的清除逻辑
3. 如需兼容旧格式，同步更新 `loadHighScore()` 的迁移逻辑

---

## 已知约束

- 禁用手势缩放（`touch-action: none`）
- 无后端，纯 localStorage 存储（上限 ~5MB）
- 触屏拖放依赖 `touch` 事件，`passive: false`
- 浏览器需支持 CSS Grid / CSS Variables
- 所有图片为内联 SVG（无外部依赖）

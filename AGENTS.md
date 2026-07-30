# AGENTS.md — LAHAI-ROI PROTOCOL (拉海洛方块)

> AI 编码助手参考手册。修改本仓库前请先阅读此文件。

---

## 项目概览

纯前端方块填充益智网页游戏，复刻自 KURO GAMES《鸣潮》中的「拉海洛方块 (LahaiRoi-Protocol)」小游戏。

- **玩法**：8×8 棋盘中拖拽多格方块填满行/列消除得分
- **6 种元素属性**：Glacio(冷凝) / Fusion(热熔) / Electro(导电) / Aero(气动) / Spectro(衍射) / Havoc(湮灭)
- **三档难度**：SIMPLE / STANDARD / CHALLENGE
- **Demo 教学**：5 个内置场景演示
- **排行榜**：localStorage 持久化，支持导出/导入/清空

**技术栈**：纯静态 HTML5 + CSS3 + Vanilla JS（零依赖）

---

## 目录结构

```
├── AGENTS.md              # ← 本文件（AI 参考手册）
├── README.md              # 项目说明（署名、许可、玩法）
├── index.html             # 入口页面（DOM 结构与事件绑定）
├── css/
│   └── game.css           # 全部样式（赛博主题，含响应式断点）
├── js/
│   ├── config.js          # 常量、方块形状定义、难度参数
│   ├── state.js           # 运行时状态 + 排行榜数据（localStorage）
│   ├── logic.js           # 纯函数：棋盘碰撞检测、权重计算
│   ├── render.js          # DOM 渲染：方块绘制、高亮提示、分数/排行榜更新
│   └── game.js            # 编排层：初始化、拖放、消除、Demo、事件绑定
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
- 全部 DOM 结构：棋盘、托盘、排行榜、弹窗、Demo 覆盖层
- `<script>` 加载顺序固定：config → state → logic → render → game
- 页脚署名（KURO GAMES → 蒲公桜 → CD_Mking）

### `js/config.js`
- `CONFIG` 对象：棋盘大小、格子尺寸、计分常量
- `ATTRIBUTES`：6 种元素定义（id + SVG icon HTML）
- `SHAPES_ALL`：24 种方块形状（二维 0/1 矩阵）
- `DIFFICULTY_CONFIG`：三档难度倍率
- `recalcLayout()`：根据窗口尺寸动态计算格子大小

### `js/state.js`
- `state` 对象：棋盘、分数、难度、Demo 模式、可用方块、游戏结束标志
- `leaderboardData`：排行榜记录 + 属性最高分

### `js/logic.js`
- `canPlaceShape(matrix, startX, startY)`：方块能否放置
- `countPlacements(matrix)`：某方块在棋盘上合法放置数
- `getShapeWeight(placements, area, difficulty)`：根据难度生成生成权重

### `js/render.js`
- DOM 渲染函数：方块绘制、高亮、分数/属性显示、排行榜
- `renderShapeInSlot(shapeData, slotIndex)`：在托盘槽中渲染形状
- `loadLeaderboard()` / `saveLeaderboard()`：localStorage 读写
- `showToast(message)`：底部提示消息

### `js/game.js`
- 主编排层：`init()` 初始化、`fillTray()` 填充方块
- 拖放系统：`onDragStart/Move/End`（鼠标 + 触屏）
- 消除逻辑：`checkLines()` 检测满行/满列、计分、属性统计
- Demo 系统：`DEMO_SCENES`（5 个场景）、`applyScene()`、`playScene()`
- 事件绑定：`initGame()` 绑定所有 DOM 事件

---

## 数据流

```
用户拖拽方块
  → onDragStart (game.js)
    → onDragMove + highlightBoard (render.js)
      → onDragEnd (game.js)
        → canPlaceShape? (logic.js)
          → placeShape + addScore (game.js)
            → checkLines (game.js)
              → fillTray (game.js) — 自适应权重生成
                → checkGameOver (game.js)
```

### 状态存储
- localStorage key: `lahairoi_v3_leaderboard`
- 格式：`{ records: [{score, date}], attrHighScores: { glacio, fusion, ... } }`

---

## 计分规则

| 事件 | 分值 | 备注 |
|------|------|------|
| 放置一个格子 | `SCORE_BLOCK` (10) × 格子数 | 乘难度倍率 |
| 消除一行/一列 | `SCORE_LINE` (100) | 乘难度倍率 |
| 多行/多列同时消除 | 额外 `(lines-1) × SCORE_MULTI_MULTIPLIER` (50) | 乘难度倍率 |
| 属性消除统计 | 每消除一个格子该属性计数 +1 | 仅正式模式 |

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
- DOM id 小驼峰（`currentScore`、`leaderboardList`）

### 全局变量
所有文件共享以下顶层全局变量：
- `CONFIG`, `ATTRIBUTES`, `SHAPES_ALL`, `DIFFICULTY_CONFIG`, `TRAY_CELL_SIZE`, `TRAY_CELL_RATIO` (config.js)
- `state`, `leaderboardData` (state.js)
- `boardEl`, `traySlots`, `draggedElement`, 等 DOM 引用 (game.js)
- `onDragStart`, `renderShapeInSlot`, `showToast`, 等函数 (render.js/game.js)

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
3. 难度切换逻辑在 `game.js` 的 `setDifficulty()` 中自动处理

### 修改 Demo 场景
编辑 `game.js` 中 `DEMO_SCENES` 数组：
- `fills`：预先填充的单元格坐标
- `except`：（当 fills=null 时）留空坐标
- `shapeMatrix`：演示用方块
- `target`：放置目标坐标
- `desc`：描述文字

### 修改排行榜存储结构
1. 更新 `state.js` 的 `leaderboardData` 默认值
2. 更新 `render.js` 的 `loadLeaderboard()` 迁移逻辑（兼容旧格式）
3. 如有字段变更，同步更新 `exportBtn` 和 `confirmImportBtn` 的校验逻辑

---

## 已知约束

- 禁用手势缩放（`touch-action: none`）
- 无后端，纯 localStorage 存储（上限 ~5MB）
- 触屏拖放依赖 `touch` 事件，`passive: false`
- 浏览器需支持 CSS Grid / CSS Variables
- 所有图片为内联 SVG（无外部依赖）

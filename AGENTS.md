# AGENTS.md — LAHAI-ROI PROTOCOL (拉海洛方块)

> AI 编码助手参考手册。修改本仓库前请先阅读此文件。

---

## 项目概览

纯前端方块填充益智网页游戏，复刻自 KURO GAMES《鸣潮》中的「拉海洛方块 (LahaiRoi-Protocol)」小游戏。

- **玩法**：8×8 棋盘中拖拽多格方块填满行/列消除得分；拖动过程中可顺时针旋转方块
- **6 种元素属性**：Glacio(冷凝) / Fusion(热熔) / Electro(导电) / Aero(气动) / Spectro(衍射) / Havoc(湮灭)
- **图标方块**：属性 SVG 为元素色方底 + 白色圆底 + 元素色图标，按 32 种 matrix 形状逐格组合
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
│   ├── header.css         # 顶部按钮、标题、分数、难度、旋转按钮
│   ├── board.css          # 棋盘、格子、托盘、方块
│   ├── overlays.css       # Toast、游戏结束、消除动画
│   ├── tutorial.css       # Demo 教学界面
│   └── responsive.css     # 响应式断点（最后加载）
├── audios/
│   └── BGM.mp3            # 循环背景音乐
├── js/
│   ├── shapes.js          # 方块形状数据（32 种）
│   ├── config.js          # 常量、难度参数
│   ├── state.js           # 运行时状态（含最高分字段）
│   ├── logic.js           # 纯函数：棋盘碰撞检测、旋转、权重计算
│   ├── elements.js        # 共享 DOM 引用、拖拽状态、窗口缩放处理
│   ├── render.js          # DOM 渲染：方块绘制、高亮提示、分数显示
│   ├── drag.js            # 鼠标/触屏拖放与旋转
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
- 全部 DOM 结构：棋盘、托盘、游戏结束遮罩、Demo 覆盖层、移动端旋转按钮（`#rotateBtn`）
- `<link>` 加载顺序固定：base → header → board → overlays → tutorial → responsive
- `<script>` 加载顺序固定：shapes → config → state → logic → elements → render → drag → board → tutorial → fullscreen → audio → ui → game
- 页脚署名（KURO GAMES → 蒲公桜 → CD_Mking）

### `css/*.css`
- `base.css`：重置、`:root` 变量、`.game-terminal`、终端容器、页脚、属性图标
- `header.css`：帮助/全屏/音乐/旋转按钮、标题、分数、难度选择
- `board.css`：游戏区、棋盘、格子状态、托盘、拖拽方块、旋转回弹动画
- `overlays.css`：Toast、游戏结束遮罩、消除动画（白色内芯收缩 + 外圈扩散）
- `tutorial.css`：Demo 覆盖层、面板、导航、播放按钮、拖拽幽灵
- `responsive.css`：全部 `@media` 断点，必须最后加载以覆盖基础样式

### `js/shapes.js`
- `SHAPES_DATA`：方块形状唯一数据源（含 id / matrix）
- `SHAPES_ALL`：从 `SHAPES_DATA.shapes` 提取的 32 种二维 0/1 矩阵（含大量互为旋转的重复条目）

### `js/config.js`
- `CONFIG` 对象：棋盘大小、格子尺寸、计分常量、连击倍率与消除动画时序
- `ATTRIBUTES`：6 种元素定义（id + SVG icon HTML）
- `DIFFICULTY_CONFIG`：三档难度倍率
- `recalcLayout()`：根据窗口尺寸动态计算格子大小

### `js/state.js`
- `state` 对象：棋盘、当前分数、历史最高分、连击数、难度、Demo 模式、可用方块、游戏结束标志

### `js/logic.js`
- `rotateMatrixCW(matrix)`：顺时针旋转 90°，返回新矩阵，不修改入参
- `matrixKey(matrix)` / `getCanonicalMatrixKey(matrix)`：矩阵字符串键；后者取四个朝向中字典序最小的键，用于旋转等价去重
- `getRotationVariants(matrix)`：四个朝向中去重后的变体（对称形状只有 1–2 个）
- `canPlaceShape(matrix, startX, startY)`：方块能否放置
- `getShapePlacements(matrix)`：返回所有合法放置位置的 64 位位图列表
- `getShapePlacementsAllRotations(matrix)`：汇总四朝向的放置位图（去重），并给出单朝向最大放置数 `best`
- `placementsOverlap(a, b)`：判断两个放置位图是否重叠
- `canPlaceAllThree(listA, listB, listC)`：判断 3 个方块能否同时放入当前空位
- `getShapeWeight(placements, area, difficulty)`：根据难度生成生成权重
- `getLineBaseScore(lines)`：按 `100 × lines² + 100` 计算消除基础分
- `getComboMultiplier(combo)`：按 1.0 / 1.2 / 1.3 / 1.5 计算连击倍率
- `getLineClearScore(lines, combo)`：基础分 × 连击倍率

### `js/render.js`
- DOM 渲染函数：方块绘制、高亮、当前分数/最高分显示
- `buildShapeCellsHTML(matrix, attribute)`：按 matrix 用属性图标拼出形状单元格
- `renderShapeInSlot(shapeData, slotIndex)`：在托盘槽中渲染形状
- `loadHighScore()` / `saveHighScore()`：最高分 localStorage 读写与旧数据迁移
- `clearHighScore()`：重置 `state.highScore` 并删除本地最高分记录
- `updateHighScoreDisplay()`：更新最高分显示，并同步清除按钮的禁用状态
- `showToast(message)`：底部提示消息

### `js/elements.js`
- 全局 DOM 引用：`boardEl`、`traySlots`、按钮、Toast
- 拖拽状态：`draggedElement`、`draggedShapeData`、`draggedSlotIndex`、`dragPointerX/Y`（旋转锚点用的最新指针坐标）、`dragTouchId`（起手手指标识）等
- `onResize()`：窗口尺寸变化后重算布局并重绘托盘

### `js/drag.js`
- 拖放系统：`onDragStart/Move/End`（鼠标 + 触屏），拖拽期间在 document 上挂载旋转相关监听，结束时统一卸载
- 旋转入口：`onDragKeyDown`（R 键）、`onDragRightMouseDown`（右键）、移动端 `#rotateBtn`（绑定在 `ui.js`）→ `rotateDraggedShape()`
- `rotateDraggedShape()`：把 `shapeData.matrix` 换成 `rotateMatrixCW(...)` 的新矩阵后重建拖拽 DOM，并按归一化抓取点 `(fx, fy) → (1 - fy, fx)` 重算 `dragOffsetX/Y`，保证指针下的位置不跳变
- `getDragTouch(list)`：按 `dragTouchId` 从 TouchList 中找起手手指，避免第二根手指（如点旋转按钮）误落子
- `getBoardCoordinates()`：将指针坐标换算为棋盘坐标

### `js/board.js`
- 游戏初始化：`init()`、`fillTray()` 填充方块
- 棋盘操作：`placeShape()`（返回触发形状中心）、`checkLines(origin)`、`checkGameOver()`
- `checkGameOver()`：对每个待放方块判断四个朝向任一可放，避免误判死局
- 消除动画：`checkLines()` 以触发形状中心为波源，按切比雪夫距离为每个待消除格设置 `--clear-delay`；每格独立播放白色内芯收缩与外圈扩散
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
- Demo 导航、重启、全屏、清除最高分、旋转按钮（`touchstart` / `mousedown`）与窗口缩放事件
- `setDifficulty()`：难度切换与按钮状态同步

### `js/game.js`
- 入口文件：监听 `DOMContentLoaded` 并调用 `initGame()`

---

## 数据流

```
用户拖拽方块
  → onDragStart (drag.js)
    → onDragMove + highlightBoard (render.js)
      → 旋转（R 键 / 右键 / 移动端按钮）
        → rotateDraggedShape (drag.js)：换矩阵 + 重建 DOM + 重算抓取偏移
          → highlightBoard (render.js) — 立即按新朝向刷新高亮
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

1. 对 32 种形状按旋转等价去重（`getCanonicalMatrixKey()`），形状库实际只有 13 个等价类；随后对每个形状汇总四个朝向的放置位（`getShapePlacementsAllRotations()`）
   - 过滤掉四朝向都放不下的形状
   - 联合放置位图用于 `canPlaceAllThree()`，即允许三块各用不同朝向
   - `p = best + 1`（`best` 为单个朝向下的最大放置数，不把多朝向的放置数直接相加，避免权重被平方放大），`area` 为方块占用的格子数
2. 按难度调用 `getShapeWeight()` 计算单个形状权重
   - **SIMPLE**：`p²/area` — 倾向小块、高放置数
   - **STANDARD**：`p` — 线性权重
   - **CHALLENGE**：`p^0.3 × area` — 倾向大块、低放置数
3. 枚举所有无序组合 `a ≤ b ≤ c`（允许重复），用 `canPlaceAllThree()` 判断联合可放置
4. 组合权重取三个形状权重的几何平均，再乘以该组合的排列数（1/3/6）
   - 概率模型等价于 `N³` 有序三元组（`N` 为当前可放置形状数，最大 13）
5. 按组合总权重随机抽取，再将选中的 3 个形状随机分配到托盘槽位
   - 托盘里存放的是未旋转的原始朝向，玩家拖拽时自行旋转
6. 元素属性仍独立随机；棋盘空位少于 3 个时不存在合法组合，直接判定游戏结束

最多进行 `C(15, 3) = 455` 次联合可放置判定（13 个等价类）；通过乘以排列数计入顺序，避免重复判定。旋转会让放置位图变长，但候选形状数从 32 降到 13，随机棋盘实测 `fillTray()` 平均约 1–2ms。

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
- **JavaScript**：ES5+（以 var 声明、function 表达式为主），无 import/export
- **CSS**：CSS 变量 + Flexbox/Grid，移动端响应式（@media 断点 899px / 480px / 600px / 400px）
- 所有 JS 文件在 HTML 中用 `<script>` 顺序加载，共享全局变量

### 命名
- `var` / `function` 全小驼峰（camelCase）
- 常量全大写下划线（`SCORE_LINE_UNIT`）
- CSS class 短横线（`diff-btn`、`shape-cell`）
- DOM id 小驼峰（`currentScore`、`highScore`）

### 全局变量
所有文件共享以下顶层全局变量：
- `SHAPES_DATA`, `SHAPES_ALL` (shapes.js)
- `CONFIG`, `ATTRIBUTES`, `DIFFICULTY_CONFIG`, `TRAY_CELL_SIZE`, `TRAY_CELL_RATIO` (config.js)
- `state` (state.js)
- `boardEl`, `traySlots`, `draggedElement`, 等 DOM 引用与拖拽状态 (elements.js)
- `onDragStart` / `onDragEnd` / `rotateDraggedShape` (drag.js)
- `canPlaceShape`, `getShapePlacements`, `placementsOverlap`, `canPlaceAllThree`, `getShapeWeight` (logic.js)
- `rotateMatrixCW`, `getRotationVariants`, `getCanonicalMatrixKey`, `getShapePlacementsAllRotations` (logic.js)
- `getLineBaseScore`, `getComboMultiplier`, `getLineClearScore` (logic.js)
- `init`, `fillTray`, `placeShape`, `checkLines`, `checkGameOver`, `addScore` (board.js)
- `DEMO_SCENES`, `applyScene`, `playScene` 等教学函数 (tutorial.js)
- `renderShapeInSlot`, `showToast`, `highlightBoard` 等渲染函数 (render.js)
- `initBgm`, `tryPlayBgm`, `updateMusicBtn` (audio.js)
- `initGame`, `setDifficulty` (ui.js)

### CSS 变量
```css
--bg-gradient, --grid-line, --cell-empty
--attr-glacio / --attr-fusion / --attr-electro / --attr-aero / --attr-spectro / --attr-havoc
--accent-color, --danger-color, --text-color
--cell-size, --grid-gap, --board-size
```

---

## 常见修改场景

### 添加新方块形状
在 `shapes.js` 的 `SHAPES_DATA.shapes` 数组末尾追加 `{ id, matrix }`；行列尺寸由 matrix 自动推导，无需同步额外字段。

### 调整旋转手感 / 旋转按钮
- 旋转逻辑在 `drag.js` 的 `rotateDraggedShape()`：换矩阵后必须重新 `applyShapeGrid` + `buildShapeCellsHTML`，并按 `(fx, fy) → (1 - fy, fx)` 重算 `dragOffsetX/Y`
- 锚点必须用 `style.left/top` 而不是 `getBoundingClientRect()`，因为 `.dragging` 带 `scale(1.05)`，视觉框比布局框大 5%
- 输入入口：`onDragKeyDown`（R 键）、`onDragRightMouseDown`（右键）、`ui.js` 中绑定的 `#rotateBtn`（触屏）
- 按钮位置/尺寸在 `header.css` 的 `.rotate-btn`，横屏覆盖在 `responsive.css` 的 coarse landscape 断点里；只在 `body.is-dragging` 时显示，纯鼠标设备用 `@media (hover: hover) and (pointer: fine)` 隐藏
- 旋转角度会写回 `shapeData.matrix`（与 `state.availableShapes` 同引用），因此回托盘后角度保留；若要重置，需要额外保存原始矩阵

### 更换背景音乐
替换 `audios/BGM.mp3`（保持文件名），或在 `index.html` 的 `<audio id="bgm">` 中修改 `src` 路径。默认音量在 `audio.js` 的 `BGM_VOLUME` 中调整。

### 增加新难度
1. `config.js` 的 `DIFFICULTY_CONFIG` 添加新条目
2. 在 `index.html` 的 `.difficulty-selector` 中添加对应 `<button>`
3. 难度切换逻辑在 `ui.js` 的 `setDifficulty()` 中自动处理
4. 如需自定义生成权重，修改 `logic.js` 的 `getShapeWeight()`；未匹配的难度默认按 `p` 线性权重

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
- 触屏拖放依赖 `touch` 事件，`passive: false`；多点触控必须按 `touch.identifier` 过滤，不能直接取 `touches[0]`
- 旋转仅支持顺时针（转 4 次回到原状），不支持逆时针或自由角度
- 右键旋转只在拖拽期间生效；拖拽期间需屏蔽 `contextmenu`，否则会弹出系统菜单
- 浏览器需支持 CSS Grid / CSS Variables
- 属性图标与全屏图标为本地 SVG 文件，无外部网络依赖

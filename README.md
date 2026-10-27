# 拉海洛方块 · LAHAI-ROI PROTOCOL

一款基于《鸣潮》「拉海洛方块」小游戏的方块填充益智网页游戏。

> **复刻自 KURO GAMES《鸣潮》中的「拉海洛方块 (LahaiRoi-Protocol)」小游戏。**

## 游戏玩法

在 **8×8** 的网格棋盘上，将方块拖拽至合适位置，填满整行或整列即可消除得分。

- 每个方块带有 **6 种元素属性**之一（冷凝 / 热熔 / 导电 / 气动 / 衍射 / 湮灭）
- 一行/一列消除得 **100 分**，多行/多列同时消除有额外连消加成
- 连续消除可累积高分，刷新历史最高分

## 特性

- **三档难度**：SIMPL（简单）/ STANDARD（标准）/ CHALLENGE（挑战），影响方块出现偏向与分数倍率
- **自适应方块生成**：根据棋盘空位与难度动态计算权重，并保证每批 3 个方块都能全部放入当前空位
- **拖拽放置**：鼠标或触屏均可操作，放置时有高亮提示
- **Demo 演示**：内置 5 个教学场景，演示消除与连消机制
- **背景音乐**：循环播放 BGM，支持一键静音并记住静音状态
- **最高分**：本地保存历史最高分，刷新页面后仍会保留，可手动清除

## 技术栈

纯前端，零依赖。

- HTML5 + CSS3（Flexbox / Grid）
- Vanilla JavaScript（ES5+）
- localStorage 持久化

## 项目结构

```
├── index.html              # 入口页面
├── css/
│   ├── base.css            # 基础重置、变量、终端外壳
│   ├── header.css          # 顶部按钮、标题、分数、难度
│   ├── board.css           # 棋盘、格子、托盘、方块
│   ├── overlays.css        # Toast、游戏结束、消除动画
│   ├── tutorial.css        # Demo 教学界面
│   └── responsive.css      # 响应式断点（最后加载）
├── audios/
│   └── BGM.mp3             # 循环背景音乐
├── js/
│   ├── shapes.js           # 方块形状数据（32 种）
│   ├── config.js           # 常量、难度配置
│   ├── state.js            # 运行时状态与最高分
│   ├── logic.js            # 纯逻辑：棋盘检测、权重计算
│   ├── elements.js         # 共享 DOM 引用、拖拽状态、窗口缩放
│   ├── render.js           # DOM 渲染：方块绘制、高亮、分数显示
│   ├── drag.js             # 鼠标/触屏拖放
│   ├── board.js            # 棋盘初始化、方块生成、放置、消除、计分
│   ├── tutorial.js         # Demo 教学场景与播放
│   ├── fullscreen.js       # 全屏切换
│   ├── audio.js            # 背景音乐与静音控制
│   ├── ui.js               # DOM 绑定、事件、难度切换
│   └── game.js             # 入口：DOMContentLoaded → initGame()
├── img/
│   └── attribute/          # 6 种元素属性图标（SVG）
```

## 本地运行

直接双击 `index.html` 在浏览器打开即可。也可通过任意静态服务器运行：

```bash
# Python
python -m http.server 8080

# Node.js (npx)
npx serve .
```

## 许可协议

本项目基于 **CC BY-NC-SA 4.0** 许可协议发布。

**原文地址：** [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)

### 你可以

- **共享** — 在任何媒介以任何形式复制、发行本作品
- **演绎** — 修改、转换或以本作品为基础进行创作

### 惟须遵守

- **署名** — 必须注明原作者及修改者，提供指向许可协议的链接，并说明是否对原作品进行了修改
- **非商业性** — 不得将本作品用于商业目的
- **相同方式共享** — 如果对原作品进行了修改，必须以相同的许可协议发布

### 署名

| 角色 | 作者 | 链接 |
|------|------|------|
| **原作** | 蒲公桜 | [bilibili](https://space.bilibili.com/831032/) |
| **修改** | CD_Mking | [GitHub](https://github.com/CDmking) |

> 原始概念来自 KURO GAMES（《鸣潮》）。

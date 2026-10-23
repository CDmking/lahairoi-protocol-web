    var DEMO_SCENES = [
        { name:'单行消除',
          fills:[[7,0],[7,2],[7,3],[7,4],[7,5],[7,6],[7,7]],
          shapeMatrix:[[1]], target:[7,1],
          desc:'填满任意整行即可触发消除' },
        { name:'多行连消',
          fills:[[4,0],[4,1],[4,2],[4,4],[4,5],[4,6],[4,7],
                 [5,0],[5,1],[5,2],[5,4],[5,5],[5,6],[5,7]],
          shapeMatrix:[[1],[1]], target:[4,3],
          desc:'同时消除多行获得额外连消加分' },
        { name:'交叉消除·角',
          fills:[[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
                 [1,7],[2,7],[3,7],[4,7],[5,7],[6,7],[7,7]],
          shapeMatrix:[[1]], target:[0,7],
          desc:'角落交叉点填满可同时消除行与列' },
        { name:'交叉消除·内',
          fills:[[3,0],[3,1],[3,2],[3,3],[3,5],[3,6],[3,7],
                 [0,4],[1,4],[2,4],[4,4],[5,4],[6,4],[7,4]],
          shapeMatrix:[[1]], target:[3,4],
          desc:'内部交叉点填满可同时消除行与列' },
        { name:'游戏结束', fills:null, except:[[0,0],[1,3],[2,6],[3,1],[4,4],[5,7],[6,2],[7,5]],
          shapeMatrix:[[1,1,1],[1,1,1],[1,1,1]], target:[0,0],
          desc:'空缺位置分散，无合适空间容纳更大方块' }
    ];

    var currentScene = 0;
    var sceneVersion = 0;
    var autoPlayTimer = null;

    function animateShapeToBoard(shapeData, slotIndex, targetX, targetY, callback) {
        var matrix = shapeData.matrix;
        var rows = matrix.length;
        var cols = matrix[0].length;
        var cellSize = CONFIG.CELL_SIZE;
        var gap = CONFIG.GAP;
        var attrId = shapeData.attribute.id;

        var cells = '';
        for (var gy = 0; gy < rows; gy++) {
            for (var gx = 0; gx < cols; gx++) {
                if (matrix[gy][gx] === 1) {
                    cells += '<div style="width:' + cellSize + 'px;height:' + cellSize + 'px;border-radius:2px;background-color:var(--attr-' + attrId + ');box-shadow:inset 0 0 5px rgba(255,255,255,0.8),0 0 10px var(--attr-' + attrId + ')"></div>';
                } else {
                    cells += '<div style="width:' + cellSize + 'px;height:' + cellSize + 'px;background:transparent"></div>';
                }
            }
        }

        var ghost = document.createElement('div');
        ghost.className = 'demo-ghost';
        ghost.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;display:grid;grid-template-columns:repeat(' + cols + ',' + cellSize + 'px);grid-template-rows:repeat(' + rows + ',' + cellSize + 'px);gap:' + gap + 'px;transition:all 0.28s cubic-bezier(.2,.9,.3,1)';
        ghost.innerHTML = cells;

        var slotRect = traySlots[slotIndex].getBoundingClientRect();
        var ghostW = cols * cellSize + (cols - 1) * gap;
        var ghostH = rows * cellSize + (rows - 1) * gap;
        var startX = slotRect.left + (slotRect.width - ghostW) / 2;
        var startY = slotRect.top + (slotRect.height - ghostH) / 2;

        var firstCellEl = boardEl.children[targetY * CONFIG.BOARD_SIZE + targetX];
        var cellRect = firstCellEl.getBoundingClientRect();

        ghost.style.left = startX + 'px';
        ghost.style.top = startY + 'px';
        document.body.appendChild(ghost);
        ghost.offsetHeight;

        ghost.style.left = cellRect.left + 'px';
        ghost.style.top = cellRect.top + 'px';
        ghost.style.transform = 'scale(0.85)';

        setTimeout(function () {
            ghost.remove();
            if (callback) callback();
        }, 340);
    }

    function clearTraySlot(index) {
        traySlots[index].innerHTML = '';
    }

    function fillBoardForScene(index) {
        var scene = DEMO_SCENES[index];
        for (var by = 0; by < CONFIG.BOARD_SIZE; by++) {
            for (var bx = 0; bx < CONFIG.BOARD_SIZE; bx++) {
                state.board[by][bx] = null;
                boardEl.children[by * CONFIG.BOARD_SIZE + bx].className = 'cell';
                boardEl.children[by * CONFIG.BOARD_SIZE + bx].innerHTML = '';
                boardEl.children[by * CONFIG.BOARD_SIZE + bx].style.opacity = '';
            }
        }

        var allAttrs = ['glacio','fusion','electro','aero','spectro','havoc'];
        var fillCells = scene.fills;
        if (fillCells === null) {
            fillCells = [];
            for (var fy = 0; fy < CONFIG.BOARD_SIZE; fy++) {
                for (var fx = 0; fx < CONFIG.BOARD_SIZE; fx++) {
                    var skip = false;
                    if (scene.except) {
                        for (var ek = 0; ek < scene.except.length; ek++) {
                            if (scene.except[ek][0] === fy && scene.except[ek][1] === fx) {
                                skip = true; break;
                            }
                        }
                    }
                    if (!skip) fillCells.push([fy, fx]);
                }
            }
        }
        for (var fi = 0; fi < fillCells.length; fi++) {
            var fy = fillCells[fi][0], fx = fillCells[fi][1];
            var aid = allAttrs[Math.floor(Math.random() * allAttrs.length)];
            state.board[fy][fx] = { attrId: aid, icon: '<img src="img/attribute/' + aid.charAt(0).toUpperCase() + aid.slice(1) + '.svg" class="attr-icon">' };
            var cel = boardEl.children[fy * CONFIG.BOARD_SIZE + fx];
            cel.className = 'cell filled attr-' + aid;
            cel.innerHTML = state.board[fy][fx].icon;
        }
    }

    function applyScene(index) {
        if (index < 0 || index >= DEMO_SCENES.length) return;
        gameOverOverlay.style.display = 'none';
        state.score = 0;
        updateScoreDisplay();

        fillBoardForScene(index);

        for (var si = 0; si < 3; si++) clearTraySlot(si);
        state.availableShapes = [null, null, null];

        var scene = DEMO_SCENES[index];
        var sceneAttr = ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)];
        state.availableShapes[0] = { matrix: scene.shapeMatrix, attribute: sceneAttr };
        renderShapeInSlot(state.availableShapes[0], 0);

        currentScene = index;
        document.getElementById('demoTitle').innerHTML = scene.name;
        document.getElementById('demoDesc').innerHTML = scene.desc;

        var dots = document.querySelectorAll('.demo-dot');
        for (var di = 0; di < dots.length; di++) dots[di].classList.toggle('active', di === index);

        var playBtn = document.getElementById('demoPlayBtn');
        playBtn.innerHTML = '重播';
        playBtn.disabled = true;

        document.getElementById('demoPrevBtn').disabled = index === 0;
        document.getElementById('demoNextBtn').disabled = index === DEMO_SCENES.length - 1;
        sceneVersion++;
    }

    function playScene() {
        var scene = DEMO_SCENES[currentScene];
        var shapeData = state.availableShapes[0];
        if (!shapeData) return;
        var savedVersion = sceneVersion;

        var slotIdx = 0;
        clearTraySlot(slotIdx);
        state.availableShapes[slotIdx] = null;

        var targetY = scene.target[0], targetX = scene.target[1];

        if (currentScene < 4) {
            animateShapeToBoard(shapeData, slotIdx, targetX, targetY, function () {
                if (savedVersion !== sceneVersion) return;
                if (!state.isDemoMode) return;
                placeShape(shapeData, targetX, targetY);
                updateScoreDisplay();
                setTimeout(function () {
                    if (savedVersion !== sceneVersion) return;
                    if (!state.isDemoMode) return;
                    checkLines();
                    updateScoreDisplay();

                    var playBtn = document.getElementById('demoPlayBtn');
                    playBtn.innerHTML = '重播';
                    playBtn.disabled = false;
                }, 600);
            });
        } else {
            animateShapeToBoard(shapeData, slotIdx, targetX, targetY, function () {
                if (savedVersion !== sceneVersion) return;
                if (!state.isDemoMode) return;

                var cellEl = boardEl.children[0];
                var cellRect = cellEl.getBoundingClientRect();
                var xMark = document.createElement('div');
                xMark.style.cssText = 'position:fixed;z-index:10000;pointer-events:none;' +
                    'color:var(--danger-color);font-size:60px;' +
                    'text-shadow:0 0 15px var(--danger-color);' +
                    'transition:all 0.3s ease;opacity:0;';
                xMark.textContent = '✕';
                xMark.style.left = (cellRect.left + cellRect.width / 2 - 30) + 'px';
                xMark.style.top = (cellRect.top + cellRect.height / 2 - 30) + 'px';
                document.body.appendChild(xMark);
                xMark.offsetHeight;
                xMark.style.opacity = '1';
                xMark.style.transform = 'scale(1.3)';

                for (var ci = 0; ci < CONFIG.BOARD_SIZE * CONFIG.BOARD_SIZE; ci++) {
                    boardEl.children[ci].style.opacity = '0.3';
                }

                setTimeout(function () {
                    xMark.remove();
                    if (savedVersion !== sceneVersion) return;
                    if (!state.isDemoMode) return;
                    state.availableShapes = [null, null, null];
                    clearTraySlot(0);
                    checkGameOver();

                    var playBtn = document.getElementById('demoPlayBtn');
                    playBtn.innerHTML = '重播';
                    playBtn.disabled = false;
                }, 1500);
            });
        }
    }

    function openDemo() {
        state.isDemoMode = true;
        gameOverOverlay.style.display = 'none';
        var overlay = document.getElementById('demoOverlay');
        if (overlay) overlay.classList.add('show');
        applyScene(0);
        if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
        autoPlayTimer = setTimeout(playScene, 1000);
    }

    function closeDemo() {
        if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
        state.isDemoMode = false;
        var overlay = document.getElementById('demoOverlay');
        if (overlay) overlay.classList.remove('show');
        init();
    }

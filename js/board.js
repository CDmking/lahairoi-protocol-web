    function init() {
        if (state.isDemoMode) {
            state.isDemoMode = false;
            var overlay = document.getElementById('demoOverlay');
            if (overlay) overlay.classList.remove('show');
        }
        recalcLayout();
        loadHighScore();

        state.board = Array.from({ length: CONFIG.BOARD_SIZE }, function () {
            return Array(CONFIG.BOARD_SIZE).fill(null);
        });
        state.score = 0;
        state.isGameOver = false;

        updateScoreDisplay();
        gameOverOverlay.style.display = 'none';

        boardEl.innerHTML = '';
        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                var cell = document.createElement('div');
                cell.className = 'cell';
                boardEl.appendChild(cell);
            }
        }

        fillTray(true);
    }

    function fillTray(force) {
        if (force === undefined) force = false;
        var isEmpty = state.availableShapes.every(function (s) { return s === null; });
        if (!isEmpty && !force) return;

        var diff = state.difficulty;

        var weightItems = [];
        var totalWeight = 0;
        for (var s = 0; s < SHAPES_ALL.length; s++) {
            var matrix = SHAPES_ALL[s];
            var placements = countPlacements(matrix);
            var area = 0;
            for (var r = 0; r < matrix.length; r++) {
                for (var c = 0; c < matrix[r].length; c++) {
                    area += matrix[r][c];
                }
            }
            var w = getShapeWeight(placements, area, diff);
            if (w > 0) {
                weightItems.push({ idx: s, w: w });
                totalWeight += w;
            }
        }

        for (var i = 0; i < 3; i++) {
            var chosenMatrix;
            if (totalWeight === 0) {
                chosenMatrix = SHAPES_ALL[Math.floor(Math.random() * SHAPES_ALL.length)];
            } else {
                var rand = Math.random() * totalWeight;
                var cum = 0;
                for (var wi = 0; wi < weightItems.length; wi++) {
                    cum += weightItems[wi].w;
                    if (rand <= cum) {
                        chosenMatrix = SHAPES_ALL[weightItems[wi].idx];
                        break;
                    }
                }
            }

            var randomAttr = ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)];
            var shapeData = { matrix: chosenMatrix, attribute: randomAttr };
            state.availableShapes[i] = shapeData;
            renderShapeInSlot(shapeData, i);
        }
        checkGameOver();
    }

    function placeShape(shapeData, startX, startY) {
        var matrix = shapeData.matrix;
        var attr = shapeData.attribute;
        var blocksPlaced = 0;

        for (var py = 0; py < matrix.length; py++) {
            for (var px = 0; px < matrix[0].length; px++) {
                if (matrix[py][px] === 1) {
                    var bX = startX + px;
                    var bY = startY + py;
                    state.board[bY][bX] = { attrId: attr.id, icon: attr.icon };
                    blocksPlaced++;

                    var cellIndex = bY * CONFIG.BOARD_SIZE + bX;
                    var cellEl = boardEl.children[cellIndex];
                    cellEl.className = 'cell filled attr-' + attr.id;
                    cellEl.innerHTML = attr.icon;
                }
            }
        }
        addScore(blocksPlaced * CONFIG.SCORE_BLOCK);
    }

    function checkLines() {
        var clearedSet = {};
        var cellsToClear = [];

        function addCell(cell) {
            var key = cell.x + ',' + cell.y;
            if (!clearedSet[key]) {
                clearedSet[key] = true;
                cellsToClear.push(cell);
            }
        }

        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            var rowData = [];
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                if (state.board[y][x] !== null) rowData.push({ x: x, y: y, attrId: state.board[y][x].attrId });
            }
            if (rowData.length === CONFIG.BOARD_SIZE) {
                rowData.forEach(addCell);
            }
        }

        for (var cx = 0; cx < CONFIG.BOARD_SIZE; cx++) {
            var colData = [];
            for (var cy = 0; cy < CONFIG.BOARD_SIZE; cy++) {
                if (state.board[cy][cx] !== null) colData.push({ x: cx, y: cy, attrId: state.board[cy][cx].attrId });
            }
            if (colData.length === CONFIG.BOARD_SIZE) {
                colData.forEach(addCell);
            }
        }

        if (cellsToClear.length > 0) {
            var linesCleared = cellsToClear.length / CONFIG.BOARD_SIZE;
            var clearScore = CONFIG.SCORE_LINE * linesCleared;
            if (linesCleared > 1) clearScore += (linesCleared - 1) * CONFIG.SCORE_MULTI_MULTIPLIER;

            cellsToClear.forEach(function (cell) {
                state.board[cell.y][cell.x] = null;

                var cellEl = boardEl.children[cell.y * CONFIG.BOARD_SIZE + cell.x];
                cellEl.className = 'cell clearing';
                cellEl.innerHTML = '';

                setTimeout(function () {
                    cellEl.className = 'cell';
                }, 300);
            });

            if (!state.isDemoMode) {
                addScore(Math.floor(clearScore));
            }
        }
    }

    function checkGameOver() {
        var hasValidMove = false;
        for (var si = 0; si < state.availableShapes.length; si++) {
            var shapeData = state.availableShapes[si];
            if (!shapeData) continue;
            for (var gy = 0; gy < CONFIG.BOARD_SIZE; gy++) {
                for (var gx = 0; gx < CONFIG.BOARD_SIZE; gx++) {
                    if (canPlaceShape(shapeData.matrix, gx, gy)) {
                        hasValidMove = true;
                        break;
                    }
                }
                if (hasValidMove) break;
            }
            if (hasValidMove) break;
        }

        if (!hasValidMove) {
            state.isGameOver = true;
            gameOverOverlay.style.display = 'flex';
        }
    }

    function addScore(points) {
        state.score += Math.floor(points * DIFFICULTY_CONFIG[state.difficulty].scoreMultiplier);

        if (!state.isDemoMode && state.score > state.highScore) {
            state.highScore = state.score;
            saveHighScore();
            updateHighScoreDisplay();
        }

        updateScoreDisplay();
    }

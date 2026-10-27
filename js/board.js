    function init() {
        if (typeof cancelDemoPlayback === 'function') cancelDemoPlayback();
        if (state.isDemoMode) {
            state.isDemoMode = false;
            var overlay = document.getElementById('demoOverlay');
            if (overlay) overlay.classList.remove('show');
        }
        loadHighScore();

        state.board = Array.from({ length: CONFIG.BOARD_SIZE }, function () {
            return Array(CONFIG.BOARD_SIZE).fill(null);
        });
        state.score = 0;
        state.combo = 0;
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
        checkGameOver();
    }

    function fillTray(force) {
        if (force === undefined) force = false;
        var isEmpty = state.availableShapes.every(function (s) { return s === null; });
        if (!isEmpty && !force) return;

        var diff = state.difficulty;
        var candidates = [];
        var emptyCells = 0;

        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                if (state.board[y][x] === null) emptyCells++;
            }
        }

        for (var s = 0; s < SHAPES_ALL.length; s++) {
            var matrix = SHAPES_ALL[s];
            var placements = getShapePlacements(matrix);
            if (placements.length === 0) continue;

            var area = 0;
            for (var r = 0; r < matrix.length; r++) {
                for (var c = 0; c < matrix[r].length; c++) {
                    area += matrix[r][c];
                }
            }

            var w = getShapeWeight(placements.length, area, diff);
            candidates.push({ idx: s, w: w, placements: placements });
        }

        var batches = [];
        var totalWeight = 0;

        if (emptyCells >= 3) {
            for (var a = 0; a < candidates.length; a++) {
                var ca = candidates[a];
                for (var b = a; b < candidates.length; b++) {
                    var cb = candidates[b];
                    for (var c = b; c < candidates.length; c++) {
                        var cc = candidates[c];
                        if (!canPlaceAllThree(ca.placements, cb.placements, cc.placements)) continue;

                        var permutations;
                        if (a === b && b === c) {
                            permutations = 1;
                        } else if (a === b || b === c) {
                            permutations = 3;
                        } else {
                            permutations = 6;
                        }

                        var comboWeight = Math.pow(ca.w * cb.w * cc.w, 1 / 3) * permutations;
                        batches.push({ ids: [ca.idx, cb.idx, cc.idx], weight: comboWeight });
                        totalWeight += comboWeight;
                    }
                }
            }
        }

        if (batches.length === 0) {
            for (var e = 0; e < 3; e++) {
                state.availableShapes[e] = null;
                renderShapeInSlot(null, e);
            }
            return;
        }

        var chosen = batches[batches.length - 1];
        var rand = Math.random() * totalWeight;
        var cum = 0;
        for (var bi = 0; bi < batches.length; bi++) {
            cum += batches[bi].weight;
            if (rand <= cum) {
                chosen = batches[bi];
                break;
            }
        }

        var order = chosen.ids.slice();
        for (var oi = order.length - 1; oi > 0; oi--) {
            var swapIndex = Math.floor(Math.random() * (oi + 1));
            var tmp = order[oi];
            order[oi] = order[swapIndex];
            order[swapIndex] = tmp;
        }

        for (var i = 0; i < 3; i++) {
            var shapeMatrix = SHAPES_ALL[order[i]];
            var randomAttr = ATTRIBUTES[Math.floor(Math.random() * ATTRIBUTES.length)];
            var shapeData = { matrix: shapeMatrix, attribute: randomAttr };
            state.availableShapes[i] = shapeData;
            renderShapeInSlot(shapeData, i);
        }
    }

    function placeShape(shapeData, startX, startY) {
        var matrix = shapeData.matrix;
        var attr = shapeData.attribute;
        var sumX = 0;
        var sumY = 0;
        var placedCount = 0;

        for (var py = 0; py < matrix.length; py++) {
            for (var px = 0; px < matrix[0].length; px++) {
                if (matrix[py][px] === 1) {
                    var bX = startX + px;
                    var bY = startY + py;
                    state.board[bY][bX] = { attrId: attr.id };

                    var cellIndex = bY * CONFIG.BOARD_SIZE + bX;
                    var cellEl = boardEl.children[cellIndex];
                    cellEl._clearToken = (cellEl._clearToken || 0) + 1;
                    cellEl.className = 'cell filled attr-' + attr.id;
                    cellEl.innerHTML = attr.icon;
                    cellEl.style.removeProperty('--clear-delay');
                    cellEl.style.removeProperty('--clear-duration');

                    sumX += bX;
                    sumY += bY;
                    placedCount++;
                }
            }
        }

        return {
            x: sumX / placedCount,
            y: sumY / placedCount
        };
    }

    function checkLines(origin) {
        var clearedSet = {};
        var cellsToClear = [];
        var linesCleared = 0;

        if (!origin) {
            origin = {
                x: (CONFIG.BOARD_SIZE - 1) / 2,
                y: (CONFIG.BOARD_SIZE - 1) / 2
            };
        }

        function addCell(cell) {
            var key = cell.x + ',' + cell.y;
            if (!clearedSet[key]) {
                clearedSet[key] = true;
                cellsToClear.push(cell);
            }
        }

        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            var rowCells = [];
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                if (state.board[y][x] !== null) rowCells.push({ x: x, y: y });
            }
            if (rowCells.length === CONFIG.BOARD_SIZE) {
                linesCleared++;
                rowCells.forEach(addCell);
            }
        }

        for (var cx = 0; cx < CONFIG.BOARD_SIZE; cx++) {
            var colCells = [];
            for (var cy = 0; cy < CONFIG.BOARD_SIZE; cy++) {
                if (state.board[cy][cx] !== null) colCells.push({ x: cx, y: cy });
            }
            if (colCells.length === CONFIG.BOARD_SIZE) {
                linesCleared++;
                colCells.forEach(addCell);
            }
        }

        if (cellsToClear.length > 0) {
            cellsToClear.forEach(function (cell) {
                state.board[cell.y][cell.x] = null;

                var cellEl = boardEl.children[cell.y * CONFIG.BOARD_SIZE + cell.x];
                var distance = Math.max(Math.abs(cell.x - origin.x), Math.abs(cell.y - origin.y));
                var delay = CONFIG.CLEAR_HOLD_MS + Math.round(distance * CONFIG.CLEAR_STAGGER_MS);
                var token = (cellEl._clearToken || 0) + 1;
                cellEl._clearToken = token;
                cellEl.className = 'cell clearing';
                cellEl.innerHTML = '';
                cellEl.style.setProperty('--clear-delay', delay + 'ms');
                cellEl.style.setProperty('--clear-duration', CONFIG.CLEAR_DURATION_MS + 'ms');

                setTimeout(function () {
                    if (cellEl._clearToken !== token) return;
                    cellEl.classList.remove('clearing');
                    cellEl.style.removeProperty('--clear-delay');
                    cellEl.style.removeProperty('--clear-duration');
                }, delay + CONFIG.CLEAR_DURATION_MS + 20);
            });

            if (!state.isDemoMode) {
                state.combo += 1;
                addScore(getLineClearScore(linesCleared, state.combo));
            }
        } else if (!state.isDemoMode) {
            state.combo = 0;
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

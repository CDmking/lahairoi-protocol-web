    function showToast(message) {
        toastBox.innerText = message;
        toastBox.classList.add('show');
        setTimeout(function () {
            toastBox.classList.remove('show');
        }, 2500);
    }

    var HIGH_SCORE_KEY = 'lahairoi_v3_highscore';
    var LEGACY_LEADERBOARD_KEY = 'lahairoi_v3_leaderboard';

    function loadHighScore() {
        var highScore = 0;
        try {
            var stored = localStorage.getItem(HIGH_SCORE_KEY);
            if (stored !== null) {
                var parsed = JSON.parse(stored);
                if (parsed && typeof parsed.highScore === 'number') {
                    highScore = parsed.highScore;
                }
            } else {
                highScore = readLegacyHighScore();
                if (highScore > 0) {
                    saveHighScoreValue(highScore);
                }
            }
        } catch (e) {
            highScore = readLegacyHighScore();
            if (highScore > 0) {
                saveHighScoreValue(highScore);
            }
        }

        try {
            localStorage.removeItem(LEGACY_LEADERBOARD_KEY);
        } catch (e) { }

        state.highScore = highScore;
        updateHighScoreDisplay();
    }

    function readLegacyHighScore() {
        var highScore = 0;
        try {
            var stored = localStorage.getItem(LEGACY_LEADERBOARD_KEY);
            if (stored) {
                var parsed = JSON.parse(stored);
                var records = Array.isArray(parsed) ? parsed : (parsed && Array.isArray(parsed.records) ? parsed.records : []);
                for (var i = 0; i < records.length; i++) {
                    if (records[i] && typeof records[i].score === 'number' && records[i].score > highScore) {
                        highScore = records[i].score;
                    }
                }
            }
        } catch (e) {
            highScore = 0;
        }
        return highScore;
    }

    function saveHighScore() {
        saveHighScoreValue(state.highScore);
    }

    function saveHighScoreValue(value) {
        try {
            localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify({ highScore: value }));
        } catch (e) { }
    }

    function updateHighScoreDisplay() {
        highScoreEl.innerText = state.highScore;
    }

    function renderShapeInSlot(shapeData, slotIndex) {
        var slotEl = traySlots[slotIndex];
        slotEl.innerHTML = '';
        if (!shapeData) return;

        var matrix = shapeData.matrix;
        var attr = shapeData.attribute;
        var rows = matrix.length;
        var cols = matrix[0].length;

        var slotH = slotEl.clientHeight || 130;
        var slotW = slotEl.clientWidth || 150;
        var cellSize = Math.min(
            TRAY_CELL_SIZE,
            Math.floor((slotH - 8 - (rows - 1) * CONFIG.GAP) / rows),
            Math.floor((slotW - 8 - (cols - 1) * CONFIG.GAP) / cols)
        );
        cellSize = Math.max(12, cellSize);
        shapeData._trayCellSize = cellSize;

        var cells = '';
        for (var sy = 0; sy < rows; sy++) {
            for (var sx = 0; sx < cols; sx++) {
                var isFilled = matrix[sy][sx] === 1;
                var cls = isFilled ? 'shape-cell attr-' + attr.id + '-bg' : 'shape-cell empty';
                var sty = isFilled ? ' style="box-shadow:inset 0 0 5px rgba(255,255,255,0.8),0 0 10px var(--attr-' + attr.id + ')"' : '';
                var inner = isFilled ? attr.icon : '';
                cells += '<div class="' + cls + '"' + sty + '>' + inner + '</div>';
            }
        }

        var shapeEl = document.createElement('div');
        shapeEl.className = 'shape-element';
        shapeEl.style.cssText = 'grid-template-columns:repeat(' + cols + ',' + cellSize + 'px);grid-template-rows:repeat(' + rows + ',' + cellSize + 'px);--cell-size:' + cellSize + 'px;left:calc(50% - ' + (cols * cellSize + (cols - 1) * CONFIG.GAP) / 2 + 'px);top:calc(50% - ' + (rows * cellSize + (rows - 1) * CONFIG.GAP) / 2 + 'px)';
        shapeEl.dataset.slotIndex = slotIndex;
        shapeEl.shapeData = shapeData;
        shapeEl.innerHTML = cells;
        shapeEl.addEventListener('mousedown', onDragStart);
        shapeEl.addEventListener('touchstart', onDragStart, { passive: false });

        slotEl.appendChild(shapeEl);
    }

    function setShapeGrid(size) {
        var m = draggedShapeData.matrix;
        var c = m[0].length, r = m.length;
        draggedElement.style.gridTemplateColumns = 'repeat(' + c + ', ' + size + 'px)';
        draggedElement.style.gridTemplateRows = 'repeat(' + r + ', ' + size + 'px)';
        draggedElement.style.setProperty('--cell-size', size + 'px');
    }

    function highlightBoard(clientX, clientY) {
        clearBoardHighlight();
        if (!draggedShapeData) return;

        var boardPos = getBoardCoordinates(clientX, clientY);
        if (!boardPos) return;

        var matrix = draggedShapeData.matrix;
        var isValid = canPlaceShape(matrix, boardPos.x, boardPos.y);
        var classToAdd = isValid ? 'hover' : 'invalid';

        for (var hy = 0; hy < matrix.length; hy++) {
            for (var hx = 0; hx < matrix[0].length; hx++) {
                if (matrix[hy][hx] === 1) {
                    var bX = boardPos.x + hx;
                    var bY = boardPos.y + hy;
                    if (bX >= 0 && bX < CONFIG.BOARD_SIZE && bY >= 0 && bY < CONFIG.BOARD_SIZE) {
                        boardEl.children[bY * CONFIG.BOARD_SIZE + bX].classList.add(classToAdd);
                    }
                }
            }
        }
    }

    function clearBoardHighlight() {
        Array.from(boardEl.children).forEach(function (cell) { cell.classList.remove('hover', 'invalid'); });
    }

    function updateScoreDisplay() {
        currentScoreEl.innerText = state.score;
    }

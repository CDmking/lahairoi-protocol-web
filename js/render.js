    var toastTimer = null;

    function showToast(message) {
        toastBox.innerText = message;
        toastBox.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toastBox.classList.remove('show');
            toastTimer = null;
        }, 2500);
    }

    var HIGH_SCORE_KEY = 'lahairoi_v3_highscore';
    var LEGACY_LEADERBOARD_KEY = 'lahairoi_v3_leaderboard';

    function migrateLegacyHighScore() {
        var legacy = readLegacyHighScore();
        if (legacy > 0) saveHighScoreValue(legacy);
        return legacy;
    }

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
                highScore = migrateLegacyHighScore();
            }
        } catch (e) {
            highScore = migrateLegacyHighScore();
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
            return 0;
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

    function clearHighScore() {
        state.highScore = 0;
        try {
            localStorage.removeItem(HIGH_SCORE_KEY);
            localStorage.removeItem(LEGACY_LEADERBOARD_KEY);
        } catch (e) { }
        updateHighScoreDisplay();
    }

    function updateHighScoreDisplay() {
        highScoreEl.innerText = state.highScore;
        if (clearHighScoreBtn) {
            clearHighScoreBtn.disabled = state.highScore <= 0;
        }
    }

    function buildShapeCellsHTML(matrix, attribute) {
        var cells = '';
        for (var sy = 0; sy < matrix.length; sy++) {
            for (var sx = 0; sx < matrix[sy].length; sx++) {
                if (matrix[sy][sx] === 1) {
                    cells += '<div class="shape-cell">' + attribute.icon + '</div>';
                } else {
                    cells += '<div class="shape-cell empty"></div>';
                }
            }
        }
        return cells;
    }

    function applyShapeGrid(el, matrix, size) {
        var rows = matrix.length;
        var cols = matrix[0].length;
        el.style.gridTemplateColumns = 'repeat(' + cols + ', ' + size + 'px)';
        el.style.gridTemplateRows = 'repeat(' + rows + ', ' + size + 'px)';
        el.style.setProperty('--cell-size', size + 'px');
    }

    function centerShapeElement(el, matrix, size) {
        var rows = matrix.length;
        var cols = matrix[0].length;
        el.style.left = 'calc(50% - ' + (cols * size + (cols - 1) * CONFIG.GAP) / 2 + 'px)';
        el.style.top = 'calc(50% - ' + (rows * size + (rows - 1) * CONFIG.GAP) / 2 + 'px)';
    }

    function renderShapeInSlot(shapeData, slotIndex) {
        var slotEl = traySlots[slotIndex];
        slotEl.innerHTML = '';
        if (!shapeData) return;

        var matrix = shapeData.matrix;
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

        var shapeEl = document.createElement('div');
        shapeEl.className = 'shape-element';
        applyShapeGrid(shapeEl, matrix, cellSize);
        centerShapeElement(shapeEl, matrix, cellSize);
        shapeEl.dataset.slotIndex = slotIndex;
        shapeEl.shapeData = shapeData;
        shapeEl.innerHTML = buildShapeCellsHTML(matrix, shapeData.attribute);
        shapeEl.addEventListener('mousedown', onDragStart);
        shapeEl.addEventListener('touchstart', onDragStart, { passive: false });

        slotEl.appendChild(shapeEl);
    }

    function setShapeGrid(size) {
        applyShapeGrid(draggedElement, draggedShapeData.matrix, size);
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

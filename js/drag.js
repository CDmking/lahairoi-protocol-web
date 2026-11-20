    var rotationHintShown = false;

    function onDragStart(e) {
        if (state.isGameOver || state.isDemoMode) return;
        if (e.type.indexOf('mouse') !== -1 && e.button !== 0) return;
        e.preventDefault();

        draggedElement = e.currentTarget;
        draggedShapeData = draggedElement.shapeData;
        draggedSlotIndex = parseInt(draggedElement.dataset.slotIndex, 10);

        setShapeGrid(CONFIG.CELL_SIZE);
        draggedElement.style.left = '';
        draggedElement.style.top = '';

        var isTouch = e.type.indexOf('touch') !== -1;
        var clientX = isTouch ? e.touches[0].clientX : e.clientX;
        var clientY = isTouch ? e.touches[0].clientY : e.clientY;

        var rect = draggedElement.getBoundingClientRect();

        dragOffsetX = clientX - rect.left;
        dragOffsetY = clientY - rect.top;
        dragPointerX = clientX;
        dragPointerY = clientY;

        draggedElement.classList.add('dragging');
        document.body.classList.add('is-dragging');
        document.body.appendChild(draggedElement);
        moveElement(clientX, clientY);

        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
        document.addEventListener('touchcancel', onDragEnd);
        document.addEventListener('keydown', onDragKeyDown);
        document.addEventListener('mousedown', onDragRightMouseDown);
        document.addEventListener('contextmenu', preventDragContextMenu);

        showRotationHint(isTouch);
    }

    function onDragMove(e) {
        if (!draggedElement) return;
        e.preventDefault();
        var isTouch = e.type.indexOf('touch') !== -1;
        var clientX = isTouch ? e.touches[0].clientX : e.clientX;
        var clientY = isTouch ? e.touches[0].clientY : e.clientY;
        updateDragPosition(clientX, clientY);
    }

    function updateDragPosition(clientX, clientY) {
        dragPointerX = clientX;
        dragPointerY = clientY;
        moveElement(clientX, clientY);
        highlightBoard(clientX, clientY);
    }

    function moveElement(clientX, clientY) {
        draggedElement.style.left = (clientX - dragOffsetX) + 'px';
        draggedElement.style.top = (clientY - dragOffsetY) + 'px';
    }

    function onDragEnd(e) {
        if (!draggedElement) return;

        var isTouch = e.type.indexOf('touch') !== -1;
        if (!isTouch && e.button !== 0) return;

        var clientX = isTouch ? e.changedTouches[0].clientX : e.clientX;
        var clientY = isTouch ? e.changedTouches[0].clientY : e.clientY;

        var canceled = e.type === 'touchcancel';
        var boardPos = canceled ? null : getBoardCoordinates(clientX, clientY);
        clearBoardHighlight();

        if (boardPos && canPlaceShape(draggedShapeData.matrix, boardPos.x, boardPos.y)) {
            var clearOrigin = placeShape(draggedShapeData, boardPos.x, boardPos.y);
            state.availableShapes[draggedSlotIndex] = null;
            draggedElement.remove();

            checkLines(clearOrigin);
            fillTray();
            checkGameOver();

        } else {
            draggedElement.remove();
            renderShapeInSlot(draggedShapeData, draggedSlotIndex);
        }

        unbindDragListeners();

        draggedElement = null;
        draggedShapeData = null;
        draggedSlotIndex = -1;
        document.body.classList.remove('is-dragging');
    }

    function unbindDragListeners() {
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);
        document.removeEventListener('touchcancel', onDragEnd);
        document.removeEventListener('keydown', onDragKeyDown);
        document.removeEventListener('mousedown', onDragRightMouseDown);
        document.removeEventListener('contextmenu', preventDragContextMenu);
    }

    function onDragKeyDown(e) {
        if (!draggedElement || e.repeat || e.isComposing) return;
        if (e.code !== 'KeyR' && (e.key || '').toLowerCase() !== 'r') return;
        e.preventDefault();
        rotateDraggedShape();
    }

    function onDragRightMouseDown(e) {
        if (!draggedElement || e.button !== 2) return;
        e.preventDefault();
        rotateDraggedShape();
    }

    function preventDragContextMenu(e) {
        if (!draggedElement) return;
        e.preventDefault();
    }

    function clampRatio(value) {
        if (value < 0) return 0;
        if (value > 1) return 1;
        return value;
    }

    function rotateDraggedShape() {
        if (!draggedElement || !draggedShapeData) return;

        var size = CONFIG.CELL_SIZE;
        var gap = CONFIG.GAP;
        var matrix = draggedShapeData.matrix;
        var cols = matrix[0].length;
        var rows = matrix.length;
        var oldWidth = cols * size + (cols - 1) * gap;
        var oldHeight = rows * size + (rows - 1) * gap;

        var left = parseFloat(draggedElement.style.left);
        var top = parseFloat(draggedElement.style.top);
        if (isNaN(left) || isNaN(top)) return;

        var ratioX = clampRatio((dragPointerX - left) / oldWidth);
        var ratioY = clampRatio((dragPointerY - top) / oldHeight);

        var rotated = rotateMatrixCW(matrix);
        draggedShapeData.matrix = rotated;

        // 顺时针旋转后宽高互换，指针在方块内的相对位置 (ratioX, ratioY) 映射为 (1 - ratioY, ratioX)
        dragOffsetX = (1 - ratioY) * oldHeight;
        dragOffsetY = ratioX * oldWidth;

        draggedElement.innerHTML = buildShapeCellsHTML(rotated, draggedShapeData.attribute);
        applyShapeGrid(draggedElement, rotated, size);
        moveElement(dragPointerX, dragPointerY);
        highlightBoard(dragPointerX, dragPointerY);

        pulseRotateFeedback();
    }

    function pulseRotateFeedback() {
        draggedElement.classList.remove('rotate-tick');
        void draggedElement.offsetWidth;
        draggedElement.classList.add('rotate-tick');
        setTimeout(function () {
            if (draggedElement) draggedElement.classList.remove('rotate-tick');
        }, 220);
        if (navigator.vibrate) navigator.vibrate(8);
    }

    function showRotationHint(isTouch) {
        if (rotationHintShown) return;
        rotationHintShown = true;
        if (!isTouch) showToast('拖动方块时按 R 或点右键，可顺时针旋转');
    }

    function getBoardCoordinates(clientX, clientY) {
        var boardRect = boardEl.getBoundingClientRect();
        var shapeLeft = clientX - dragOffsetX;
        var shapeTop = clientY - dragOffsetY;
        var threshold = CONFIG.CELL_SIZE / 2;

        if (shapeLeft > boardRect.left - threshold &&
            shapeLeft < boardRect.right + threshold &&
            shapeTop > boardRect.top - threshold &&
            shapeTop < boardRect.bottom + threshold) {

            var relativeX = shapeLeft - boardRect.left;
            var relativeY = shapeTop - boardRect.top;
            var step = CONFIG.CELL_SIZE + CONFIG.GAP;
            return { x: Math.round(relativeX / step), y: Math.round(relativeY / step) };
        }
        return null;
    }

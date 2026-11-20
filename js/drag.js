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
        var point = isTouch ? e.changedTouches[0] : e;
        dragTouchId = isTouch ? point.identifier : null;
        var clientX = point.clientX;
        var clientY = point.clientY;

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
        var point = isTouch ? getDragTouch(e.touches) : e;
        if (!point) return;
        updateDragPosition(point.clientX, point.clientY);
    }

    function getDragTouch(list) {
        if (!list) return null;
        for (var i = 0; i < list.length; i++) {
            if (list[i].identifier === dragTouchId) return list[i];
        }
        return null;
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

        var point = e;
        if (isTouch) {
            point = getDragTouch(e.changedTouches);
            if (!point) return;
        }

        var clientX = point.clientX;
        var clientY = point.clientY;

        var canceled = e.type === 'touchcancel';
        var boardPos = canceled ? null : getBoardCoordinates(clientX, clientY);
        clearBoardHighlight();
        finishRotateAnim();

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
        dragTouchId = null;
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

    // 旋转反馈：视觉角度欠债模型（详见 AGENTS.md「旋转反馈动画」）
    // a0 为本次动画的起始角度（负值表示还欠多少度回到最终朝向），m0 为按 dur 归一化的起始角速度。
    var ROTATE_BASE_MS = 170;    // 单次旋转的基础时长
    var ROTATE_MIN_MS = 70;      // 加速后的时长下限
    var ROTATE_MAX_MS = 400;     // 连续猛按导致欠债过大时的时长上限
    var ROTATE_AVG_SPEED = 1.4;  // °/ms，欠债按此平均速度定时长，把单帧步长压在 ~35° 以内
    var rotateAnim = null;       // { a0, m0, dur, start, raf }
    var lastVibrateAt = 0;

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

        spinDraggedShape();
        if (navigator.vibrate && performance.now() - lastVibrateAt > 80) {
            navigator.vibrate(8);
            lastVibrateAt = performance.now();
        }
    }

    // 三次 Hermite：A(0)=a0, A(1)=0, A'(0)=m0, A'(1)=0
    // m0 = 3|a0| 时退化为 easeOutCubic（单次旋转的旧手感），因此单次与连续旋转的速度曲线可以衔接。
    function currentRotateAngle(now) {
        if (!rotateAnim) return 0;
        var s = (now - rotateAnim.start) / rotateAnim.dur;
        if (s > 1) s = 1;
        if (s < 0) s = 0;
        var s2 = s * s;
        var s3 = s2 * s;
        return (2 * s3 - 3 * s2 + 1) * rotateAnim.a0
            + (s3 - 2 * s2 + s) * rotateAnim.m0;
    }

    // 角速度（°/ms），正值表示正在收敛到 0
    function currentRotateSpeed(now) {
        if (!rotateAnim) return 0;
        var s = (now - rotateAnim.start) / rotateAnim.dur;
        if (s > 1) s = 1;
        if (s < 0) s = 0;
        var speed = (6 * s * s - 6 * s) * rotateAnim.a0
            + (3 * s * s - 4 * s + 1) * rotateAnim.m0;
        return speed / rotateAnim.dur;
    }

    function applyRotateFrame() {
        if (!rotateAnim || !draggedElement) return;
        var now = performance.now();
        if (now - rotateAnim.start >= rotateAnim.dur) {
            finishRotateAnim();
            return;
        }
        draggedElement.style.transform = 'scale(1.05) rotate(' + currentRotateAngle(now).toFixed(2) + 'deg)';
        rotateAnim.raf = requestAnimationFrame(applyRotateFrame);
    }

    // 矩阵已经换成新朝向，于是把视觉角度整体退 90°：画面不变，再把欠债转回 0。
    // 打断时保留当前角速度（m0），并把剩余欠债按更短的时长转完，于是越快按越快转。
    function spinDraggedShape() {
        var now = performance.now();
        var a0, m0, dur;

        if (rotateAnim) {
            var speed = currentRotateSpeed(now);
            var remain = Math.max(0, rotateAnim.dur - (now - rotateAnim.start));
            a0 = currentRotateAngle(now) - 90;
            dur = Math.max(ROTATE_MIN_MS, remain * 0.55, Math.abs(a0) / ROTATE_AVG_SPEED);
            if (dur > ROTATE_MAX_MS) dur = ROTATE_MAX_MS;
            m0 = Math.min(speed * dur, 3 * Math.abs(a0));
            cancelAnimationFrame(rotateAnim.raf);
        } else {
            a0 = -90;
            dur = ROTATE_BASE_MS;
            m0 = 3 * Math.abs(a0);
        }

        if (prefersReducedMotion()) {
            finishRotateAnim();
            return;
        }

        rotateAnim = { a0: a0, m0: m0, dur: dur, start: now, raf: 0 };
        // 必须同步设置首帧角度，否则矩阵已换、transform 还是旧值，会闪一帧
        draggedElement.style.transform = 'scale(1.05) rotate(' + a0.toFixed(2) + 'deg)';
        rotateAnim.raf = requestAnimationFrame(applyRotateFrame);
    }

    function finishRotateAnim() {
        if (rotateAnim) {
            cancelAnimationFrame(rotateAnim.raf);
            rotateAnim = null;
        }
        if (draggedElement) draggedElement.style.transform = '';
    }

    function prefersReducedMotion() {
        return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }

    function showRotationHint(isTouch) {
        if (rotationHintShown) return;
        rotationHintShown = true;
        showToast(isTouch ? '拖动时点 ⟳ 按钮可顺时针旋转方块' : '拖动方块时按 R 或点右键，可顺时针旋转');
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

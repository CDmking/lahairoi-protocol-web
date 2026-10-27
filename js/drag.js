    function onDragStart(e) {
        if (state.isGameOver || state.isDemoMode) return;
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

        draggedElement.classList.add('dragging');
        document.body.appendChild(draggedElement);
        moveElement(clientX, clientY);

        document.addEventListener('mousemove', onDragMove);
        document.addEventListener('mouseup', onDragEnd);
        document.addEventListener('touchmove', onDragMove, { passive: false });
        document.addEventListener('touchend', onDragEnd);
    }

    function onDragMove(e) {
        if (!draggedElement) return;
        e.preventDefault();
        var clientX = e.type.indexOf('mouse') !== -1 ? e.clientX : e.touches[0].clientX;
        var clientY = e.type.indexOf('mouse') !== -1 ? e.clientY : e.touches[0].clientY;
        moveElement(clientX, clientY);
        highlightBoard(clientX, clientY);
    }

    function moveElement(clientX, clientY) {
        draggedElement.style.left = (clientX - dragOffsetX) + 'px';
        draggedElement.style.top = (clientY - dragOffsetY) + 'px';
    }

    function onDragEnd(e) {
        if (!draggedElement) return;

        var clientX = e.type.indexOf('mouse') !== -1 ? e.clientX : e.changedTouches[0].clientX;
        var clientY = e.type.indexOf('mouse') !== -1 ? e.clientY : e.changedTouches[0].clientY;

        var boardPos = getBoardCoordinates(clientX, clientY);
        clearBoardHighlight();

        if (boardPos && canPlaceShape(draggedShapeData.matrix, boardPos.x, boardPos.y)) {
            placeShape(draggedShapeData, boardPos.x, boardPos.y);
            state.availableShapes[draggedSlotIndex] = null;
            draggedElement.remove();

            checkLines();
            fillTray();
            checkGameOver();

        } else {
            draggedElement.remove();
            renderShapeInSlot(draggedShapeData, draggedSlotIndex);
        }

        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        document.removeEventListener('touchmove', onDragMove);
        document.removeEventListener('touchend', onDragEnd);

        draggedElement = null;
        draggedShapeData = null;
        draggedSlotIndex = -1;
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

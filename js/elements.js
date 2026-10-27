    var boardEl, traySlots, currentScoreEl, highScoreEl, gameOverOverlay, restartBtn;
    var toastBox, helpBtn, fullscreenBtn, clearHighScoreBtn;
    var draggedElement = null;
    var draggedShapeData = null;
    var draggedSlotIndex = -1;
    var dragOffsetX = 0;
    var dragOffsetY = 0;

    var resizeTimer = null;
    function onResize() {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            recalcLayout();
            for (var ri = 0; ri < 3; ri++) {
                if (state.availableShapes[ri]) renderShapeInSlot(state.availableShapes[ri], ri);
            }
        }, 150);
    }

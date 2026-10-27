    function canPlaceShape(matrix, startX, startY) {
        for (var cy = 0; cy < matrix.length; cy++) {
            for (var cx = 0; cx < matrix[0].length; cx++) {
                if (matrix[cy][cx] === 1) {
                    var bX = startX + cx;
                    var bY = startY + cy;
                    if (bX < 0 || bX >= CONFIG.BOARD_SIZE || bY < 0 || bY >= CONFIG.BOARD_SIZE) return false;
                    if (state.board[bY][bX] !== null) return false;
                }
            }
        }
        return true;
    }

    function countPlacements(matrix) {
        var count = 0;
        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                if (canPlaceShape(matrix, x, y)) count++;
            }
        }
        return count;
    }

    function getShapePlacements(matrix) {
        var placements = [];
        for (var y = 0; y < CONFIG.BOARD_SIZE; y++) {
            for (var x = 0; x < CONFIG.BOARD_SIZE; x++) {
                if (!canPlaceShape(matrix, x, y)) continue;

                var lo = 0;
                var hi = 0;
                for (var my = 0; my < matrix.length; my++) {
                    for (var mx = 0; mx < matrix[my].length; mx++) {
                        if (matrix[my][mx] === 1) {
                            var index = (y + my) * CONFIG.BOARD_SIZE + (x + mx);
                            if (index < 32) {
                                lo |= (1 << index);
                            } else {
                                hi |= (1 << (index - 32));
                            }
                        }
                    }
                }
                placements.push({ lo: lo, hi: hi });
            }
        }
        return placements;
    }

    function placementsOverlap(a, b) {
        return (a.lo & b.lo) !== 0 || (a.hi & b.hi) !== 0;
    }

    function canPlaceAllThree(listA, listB, listC) {
        var lists = [listA, listB, listC];
        lists.sort(function (a, b) { return a.length - b.length; });

        var first = lists[0];
        var second = lists[1];
        var third = lists[2];
        if (first.length === 0) return false;

        for (var i = 0; i < first.length; i++) {
            var a = first[i];
            for (var j = 0; j < second.length; j++) {
                var b = second[j];
                if (placementsOverlap(a, b)) continue;
                for (var k = 0; k < third.length; k++) {
                    var c = third[k];
                    if (!placementsOverlap(a, c) && !placementsOverlap(b, c)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    function getShapeWeight(placements, area, difficulty) {
        var p = placements + 1;
        switch (difficulty) {
            case 'easy':   return Math.pow(p, 2) / area;
            case 'normal': return p;
            case 'hard':   return Math.pow(p, 0.3) * area;
        }
    }

    function getLineBaseScore(lines) {
        if (lines <= 0) return 0;
        return CONFIG.SCORE_LINE_UNIT * lines * lines + CONFIG.SCORE_LINE_FLAT;
    }

    function getComboMultiplier(combo) {
        var index = Math.min(Math.max(combo, 1), CONFIG.COMBO_MULTIPLIERS.length) - 1;
        return CONFIG.COMBO_MULTIPLIERS[index];
    }

    function getLineClearScore(lines, combo) {
        if (lines <= 0) return 0;
        return getLineBaseScore(lines) * getComboMultiplier(combo);
    }

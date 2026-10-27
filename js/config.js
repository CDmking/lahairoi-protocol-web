    var CONFIG = {
        BOARD_SIZE: 8,
        CELL_SIZE: 54,
        GAP: 2,
        SCORE_LINE_UNIT: 100,
        SCORE_LINE_FLAT: 100,
        COMBO_MULTIPLIERS: [1, 1.2, 1.3, 1.5]
    };

    var TRAY_CELL_RATIO = 0.65;
    var TRAY_CELL_SIZE = 35;

    function recalcLayout() {
        var availW = window.innerWidth;
        var availH = window.innerHeight;

        // 移动端横屏（矮屏）：高度开销小，格子可更大
        var isShortLandscape = availW > availH && availH < 500;
        var heightOverhead = isShortLandscape ? 60 : 200;

        var cellByW = Math.floor((availW - 40) / 9);
        var cellByH = Math.floor((availH - heightOverhead) / 9);
        var newSize = Math.max(18, Math.min(cellByW, cellByH, 64));

        CONFIG.CELL_SIZE = newSize;
        CONFIG.GAP = Math.max(1, Math.floor(newSize / 27));
        TRAY_CELL_SIZE = Math.floor(newSize * TRAY_CELL_RATIO);

        document.documentElement.style.setProperty('--cell-size', newSize + 'px');
        document.documentElement.style.setProperty('--grid-gap', CONFIG.GAP + 'px');
        document.documentElement.style.setProperty('--board-size', CONFIG.BOARD_SIZE);
    }

    recalcLayout();

    var ATTRIBUTES = [
        { id: 'glacio', icon: '<img src="img/attribute/Glacio.svg" class="attr-icon">' },
        { id: 'fusion', icon: '<img src="img/attribute/Fusion.svg" class="attr-icon">' },
        { id: 'electro', icon: '<img src="img/attribute/Electro.svg" class="attr-icon">' },
        { id: 'aero', icon: '<img src="img/attribute/Aero.svg" class="attr-icon">' },
        { id: 'spectro', icon: '<img src="img/attribute/Spectro.svg" class="attr-icon">' },
        { id: 'havoc', icon: '<img src="img/attribute/Havoc.svg" class="attr-icon">' }
    ];

    var DIFFICULTY_CONFIG = {
        easy:   { scoreMultiplier: 0.7 },
        normal: { scoreMultiplier: 1.0 },
        hard:   { scoreMultiplier: 1.5 }
    };

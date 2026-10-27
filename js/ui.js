    var eventsBound = false;

    function setDifficulty(difficulty) {
        if (!DIFFICULTY_CONFIG[difficulty]) return;
        state.difficulty = difficulty;
        var buttons = document.querySelectorAll('.diff-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.toggle('active', buttons[i].dataset.diff === difficulty);
        }
        init();
    }

    function initGame() {
        boardEl = document.getElementById('board');
        traySlots = [
            document.getElementById('slot-0'),
            document.getElementById('slot-1'),
            document.getElementById('slot-2')
        ];
        currentScoreEl = document.getElementById('currentScore');
        highScoreEl = document.getElementById('highScore');
        gameOverOverlay = document.getElementById('gameOverOverlay');
        restartBtn = document.getElementById('restartBtn');
        toastBox = document.getElementById('toastBox');

        helpBtn = document.getElementById('helpBtn');
        fullscreenBtn = document.getElementById('fullscreenBtn');
        clearHighScoreBtn = document.getElementById('clearHighScoreBtn');

        initBgm();

        if (!eventsBound) {
            initFullscreen();
            restartBtn.addEventListener('click', init);

            clearHighScoreBtn.addEventListener('click', function () {
                if (state.highScore <= 0) return;
                if (!window.confirm('确定要清除最高分吗？此操作不可撤销。')) return;
                clearHighScore();
                showToast('最高分已清除');
            });

            var diffBtns = document.querySelectorAll('.diff-btn');
            for (var di = 0; di < diffBtns.length; di++) {
                diffBtns[di].addEventListener('click', function () {
                    var diff = this.dataset.diff;
                    if (diff === state.difficulty) return;
                    setDifficulty(diff);
                });
            }

            helpBtn.addEventListener('click', function (e) {
                e.stopPropagation();
                openDemo();
            });

            document.getElementById('demoPrevBtn').addEventListener('click', function () {
                if (currentScene > 0) {
                    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                    applyScene(currentScene - 1);
                    autoPlayTimer = setTimeout(playScene, 1000);
                }
            });

            document.getElementById('demoNextBtn').addEventListener('click', function () {
                if (currentScene < DEMO_SCENES.length - 1) {
                    if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                    applyScene(currentScene + 1);
                    autoPlayTimer = setTimeout(playScene, 1000);
                }
            });

            document.getElementById('demoOverlayClose').addEventListener('click', function () {
                closeDemo();
            });

            document.getElementById('demoPlayBtn').addEventListener('click', function () {
                if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                applyScene(currentScene);
                playScene();
            });

            document.getElementById('demoOverlay').addEventListener('click', function (e) {
                if (e.target === this) closeDemo();
            });

            var dots = document.querySelectorAll('.demo-dot');
            for (var dbi = 0; dbi < dots.length; dbi++) {
                dots[dbi].addEventListener('click', function () {
                    var idx = parseInt(this.dataset.index);
                    if (!isNaN(idx) && idx !== currentScene) {
                        if (autoPlayTimer) { clearTimeout(autoPlayTimer); autoPlayTimer = null; }
                        applyScene(idx);
                        autoPlayTimer = setTimeout(playScene, 1000);
                    }
                });
            }

            eventsBound = true;

            window.addEventListener('resize', onResize);
            window.addEventListener('orientationchange', onResize);
        }

        setDifficulty(state.difficulty);
    }

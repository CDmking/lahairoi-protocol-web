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
        rotateBtn = document.getElementById('rotateBtn');

        initBgm();

        if (!eventsBound) {
            buildDemoDots();
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

            if (rotateBtn) {
                rotateBtn.addEventListener('pointerdown', function (e) {
                    if (!draggedElement) return;
                    e.preventDefault();
                    e.stopPropagation();
                    rotateDraggedShape();
                });
            }

            // 指针序列被系统中断（切后台、来电、失去焦点）时把方块放回托盘
            window.addEventListener('blur', cancelDrag);
            document.addEventListener('visibilitychange', function () {
                if (document.visibilityState === 'hidden') cancelDrag();
            });

            document.getElementById('demoPrevBtn').addEventListener('click', function () {
                if (currentScene > 0) {
                    applyScene(currentScene - 1);
                    scheduleAutoPlay(1000);
                }
            });

            document.getElementById('demoNextBtn').addEventListener('click', function () {
                if (currentScene < DEMO_SCENES.length - 1) {
                    applyScene(currentScene + 1);
                    scheduleAutoPlay(1000);
                }
            });

            document.getElementById('demoOverlayClose').addEventListener('click', function () {
                closeDemo();
            });

            document.getElementById('demoPlayBtn').addEventListener('click', function () {
                cancelAutoPlay();
                applyScene(currentScene);
                playScene();
            });

            document.getElementById('demoOverlay').addEventListener('click', function (e) {
                if (e.target === this) closeDemo();
            });

            var dots = document.querySelectorAll('.demo-dot');
            for (var dbi = 0; dbi < dots.length; dbi++) {
                dots[dbi].addEventListener('click', function () {
                    var idx = parseInt(this.dataset.index, 10);
                    if (!isNaN(idx) && idx !== currentScene) {
                        applyScene(idx);
                        scheduleAutoPlay(1000);
                    }
                });
            }

            eventsBound = true;

            window.addEventListener('resize', onResize);
            window.addEventListener('orientationchange', onResize);
        }

        setDifficulty(state.difficulty);
    }

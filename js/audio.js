    var bgmEl = null;
    var musicBtn = null;
    var bgmInitialized = false;
    var bgmResumeHandler = null;
    var BGM_VOLUME = 0.5;
    var BGM_MUTED_KEY = 'lahairoi_v3_bgm_muted';

    function initBgm() {
        if (bgmInitialized) return;

        bgmEl = document.getElementById('bgm');
        musicBtn = document.getElementById('musicBtn');
        if (!bgmEl || !musicBtn) return;

        bgmInitialized = true;
        bgmEl.volume = BGM_VOLUME;

        var muted = false;
        try {
            muted = localStorage.getItem(BGM_MUTED_KEY) === '1';
        } catch (e) { }
        bgmEl.muted = muted;
        updateMusicBtn();

        musicBtn.addEventListener('click', function () {
            bgmEl.muted = !bgmEl.muted;
            try {
                localStorage.setItem(BGM_MUTED_KEY, bgmEl.muted ? '1' : '0');
            } catch (e) { }
            updateMusicBtn();
            if (!bgmEl.muted) tryPlayBgm();
        });

        tryPlayBgm();

        bgmResumeHandler = function (event) {
            if (event && event.target === musicBtn) return;
            tryPlayBgm();
            removeBgmResumeListeners();
        };
        document.addEventListener('pointerdown', bgmResumeHandler, true);
        document.addEventListener('touchstart', bgmResumeHandler, true);
        document.addEventListener('keydown', bgmResumeHandler, true);
    }

    function removeBgmResumeListeners() {
        if (!bgmResumeHandler) return;
        document.removeEventListener('pointerdown', bgmResumeHandler, true);
        document.removeEventListener('touchstart', bgmResumeHandler, true);
        document.removeEventListener('keydown', bgmResumeHandler, true);
        bgmResumeHandler = null;
    }

    function tryPlayBgm() {
        if (!bgmEl || bgmEl.muted) return;
        try {
            var playPromise = bgmEl.play();
            if (playPromise && typeof playPromise.then === 'function') {
                playPromise.then(function () {
                    removeBgmResumeListeners();
                }).catch(function () { });
            }
        } catch (e) { }
    }

    function updateMusicBtn() {
        if (!musicBtn || !bgmEl) return;
        var muted = bgmEl.muted;
        musicBtn.classList.toggle('muted', muted);
        musicBtn.innerText = muted ? '✕' : '♫';
        musicBtn.setAttribute('title', muted ? '播放背景音乐' : '静音背景音乐');
        musicBtn.setAttribute('aria-label', muted ? '播放背景音乐' : '静音背景音乐');
        musicBtn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    }

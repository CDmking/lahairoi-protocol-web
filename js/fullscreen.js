    function getFullscreenProp() {
        var el = document.documentElement;
        if (el.requestFullscreen) return { request: 'requestFullscreen', exit: 'exitFullscreen', elem: 'fullscreenElement' };
        if (el.webkitRequestFullscreen) return { request: 'webkitRequestFullscreen', exit: 'webkitExitFullscreen', elem: 'webkitFullscreenElement' };
        if (el.msRequestFullscreen) return { request: 'msRequestFullscreen', exit: 'msExitFullscreen', elem: 'msFullscreenElement' };
        return null;
    }

    function isFullscreen() {
        var prop = getFullscreenProp();
        if (!prop) return false;
        return !!(document[prop.elem]);
    }

    function updateFullscreenBtn() {
        if (!fullscreenBtn) return;
        var active = isFullscreen();
        fullscreenBtn.classList.toggle('active', active);
        fullscreenBtn.setAttribute('title', active ? '退出全屏' : '全屏');
        fullscreenBtn.setAttribute('aria-label', active ? '退出全屏' : '全屏');
    }

    function toggleFullscreen() {
        var prop = getFullscreenProp();
        if (!prop) return;
        if (isFullscreen()) {
            var exitFn = document[prop.exit] ? document[prop.exit].bind(document) : null;
            if (exitFn) exitFn();
            return;
        }
        var el = document.documentElement;
        var req = el[prop.request] ? el[prop.request].call(el) : null;
        if (req && typeof req.catch === 'function') {
            req.catch(function () {
                showToast('无法进入全屏模式。');
            });
        }
    }

    function initFullscreen() {
        var prop = getFullscreenProp();
        if (!prop) {
            if (fullscreenBtn) fullscreenBtn.style.display = 'none';
            return;
        }
        var changeName = prop.request === 'webkitRequestFullscreen' ? 'webkitfullscreenchange' :
                         (prop.request === 'msRequestFullscreen' ? 'msfullscreenchange' : 'fullscreenchange');
        document.addEventListener(changeName, updateFullscreenBtn);
        fullscreenBtn.addEventListener('click', toggleFullscreen);
        updateFullscreenBtn();
    }

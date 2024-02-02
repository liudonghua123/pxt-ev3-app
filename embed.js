(function() {
    if (window.ksRunnerInit) return;

    // This line gets patched up by the cloud
    var pxtConfig = {
    "relprefix": "/pxt-ev3-app/",
    "verprefix": "",
    "workerjs": "/pxt-ev3-app/worker.js",
    "monacoworkerjs": "/pxt-ev3-app/monacoworker.js",
    "gifworkerjs": "/pxt-ev3-app/gifjs/gif.worker.js",
    "serviceworkerjs": "/pxt-ev3-app/serviceworker.js",
    "typeScriptWorkerJs": "/pxt-ev3-app/tsworker.js",
    "pxtVersion": "9.3.13",
    "pxtRelId": "localDirRelId",
    "pxtCdnUrl": "/pxt-ev3-app/",
    "commitCdnUrl": "/pxt-ev3-app/",
    "blobCdnUrl": "/pxt-ev3-app/",
    "cdnUrl": "/pxt-ev3-app/",
    "targetVersion": "0.0.0",
    "targetRelId": "",
    "targetUrl": "",
    "targetId": "ev3",
    "simUrl": "/pxt-ev3-app/simulator.html",
    "simserviceworkerUrl": "/pxt-ev3-app/simulatorserviceworker.js",
    "simworkerconfigUrl": "/pxt-ev3-app/workerConfig.js",
    "partsUrl": "/pxt-ev3-app/siminstructions.html",
    "runUrl": "/pxt-ev3-app/run.html",
    "docsUrl": "/pxt-ev3-app/docs.html",
    "multiUrl": "/pxt-ev3-app/multi.html",
    "asseteditorUrl": "/pxt-ev3-app/asseteditor.html",
    "skillmapUrl": "/pxt-ev3-app/skillmap.html",
    "authcodeUrl": "/pxt-ev3-app/authcode.html",
    "multiplayerUrl": "/pxt-ev3-app/multiplayer.html",
    "kioskUrl": "/pxt-ev3-app/kiosk.html",
    "teachertoolUrl": "/pxt-ev3-app/teachertool.html",
    "isStatic": true
};

    var scripts = [
        "/pxt-ev3-app/highlight.js/highlight.pack.js",
        "/pxt-ev3-app/marked/marked.min.js",
    ]

    if (typeof jQuery == "undefined")
        scripts.unshift("/pxt-ev3-app/jquery.js")
    if (typeof jQuery == "undefined" || !jQuery.prototype.sidebar)
        scripts.push("/pxt-ev3-app/semantic.js")
    if (!window.pxtTargetBundle)
        scripts.push("/pxt-ev3-app/target.js");
    scripts.push("/pxt-ev3-app/pxtembed.js");

    var pxtCallbacks = []

    window.ksRunnerReady = function(f) {
        if (pxtCallbacks == null) f()
        else pxtCallbacks.push(f)
    }

    window.ksRunnerWhenLoaded = function() {
        pxt.docs.requireHighlightJs = function() { return hljs; }
        pxt.setupWebConfig(pxtConfig || window.pxtWebConfig)
        pxt.runner.initCallbacks = pxtCallbacks
        pxtCallbacks.push(function() {
            pxtCallbacks = null
        })
        pxt.runner.init();
    }

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
    })

} ())

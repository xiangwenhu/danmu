import getManager, { DanmuManager } from "./lib/index";

const videoEl = document.querySelector("video");
let isPlayed = false;
videoEl.oncanplay = function() {
    if (!isPlayed) {
        isPlayed = true;
        startBatch();
    }
};

const containerEl = document.getElementById("container");
function startBatch() {
    let manager: DanmuManager | null = null;

    manager = getManager(containerEl);

    manager.sendDanmu(["随机的弹幕哦" + Math.random()]);
    setInterval(function() {
        manager.sendDanmu([
            "随机的弹幕哦随机的弹幕哦" + Math.random(),
            "随机的弹幕哦随机的弹幕哦随机的弹幕哦随机的弹幕哦-随机的弹幕哦随机的弹幕哦随机的弹幕哦随机的弹幕哦" + Math.random(),
            // "随机的弹幕哦随机的弹幕哦弹幕哦" + Math.random(),
            // "随机的弹幕哦随机的弹幕哦随机的弹幕哦随机的弹幕哦" + Math.random(),
            // "随机的弹幕哦随机的弹哦随机的弹幕哦" + Math.random()
        ]);
    }, 5000);
}

(function() {
    var script = document.createElement("script");
    script.onload = function() {
        var stats = new window.Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop);
        });
    };
    script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
    document.head.appendChild(script);
})();

// setInterval(function() {
//     const allItems = document.querySelectorAll(".danmu-item");
//     const len = allItems.length;

//     const inViewLen = Array.from(allItems).filter(function(item) {
//         const rect = item.getBoundingClientRect();
//         const b =
//             !item.classList.contains("hide") && rect.left + rect.width > 200 && rect.left < 1549;
//         return b;
//     }).length;

//     console.log("total:", len, "  in view:", inViewLen);
// }, 5000);

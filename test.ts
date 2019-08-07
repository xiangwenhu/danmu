import getManager, { DanmuManager } from "./lib/index";

const videoEl = document.querySelector("video");
let isPlayed = false;
videoEl.oncanplay = function() {
    if (!isPlayed) {
        isPlayed = true;
    }
};

var manager: DanmuManager | null = null;

const containerEl = document.getElementById("container");
function startBatch() {
    manager = getManager(containerEl);
    (window as any).manager = manager;
    manager.init();
    manager.start();
    manager.sendDanmu(["随机的弹幕哦" + Math.random()]);
    setInterval(function() {
        manager.sendDanmu([

            "<img height='100%' src='//img1.cache.jj.cn/myjj/my.cl/pc_live/m_resource/week5/1.png'>随机的弹幕哦随机的弹幕哦" + Math.random(),
            "随机的弹幕哦随机的弹幕哦随机的" +
                Math.random(),
            // "哦" + Math.random(),
            "666-8888888" + Math.random(),
            "<span style='color:red'>真美</span"
        ]);
    }, 1000);
}

startBatch();
const txtDanmuEl: HTMLInputElement = document.getElementById("txtDanmu") as HTMLInputElement;
document.getElementById("btnSend").addEventListener("click", () => {
    manager && manager.sendDanmu(txtDanmuEl.value);
});

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

const lbTotal = document.getElementById("lbTotal");
const lbHide = document.getElementById("lbHide");
const lbInView = document.getElementById("lbInView");

const rect = containerEl.getBoundingClientRect();
const { left, width } = rect;
const right = left + width;
setInterval(function() {
    (window as any).requestIdleCallback(() => {
        const allItems = Array.from(document.querySelectorAll(".danmu-item"));
        const len = allItems.length;
        const inHideLen = allItems.filter(item => item.classList.contains("hide")).length;
        const inViewLen = allItems.filter(function(item) {
            const rect = item.getBoundingClientRect();
            const b = !item.classList.contains("hide") && rect.left + rect.width >= left;
            return b;
        }).length;

        lbTotal.innerText = len + "";
        lbHide.innerHTML = inHideLen + "";
        lbInView.innerHTML = inViewLen + "";
    });
}, 5000);

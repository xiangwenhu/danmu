const videoEl = document.querySelector("video");
const aniElement = document.querySelector("#danmu1");
const aniElement2 = document.querySelector("#danmu2");
const aniElement3 = document.querySelector("#danmu3");

let HEIGHT = videoEl.clientHeight;
let WIDTH = videoEl.clientWidth;

let listenerAdded = false;
let frame1StartTime = null;
let currentFrameItem = null;
function startAni() {
    aniElement.classList.add("danmu-ani");

    if (listenerAdded) {
        return;
    }

    aniElement.addEventListener("transitionend", ev => {
        if (ev.target.classList.contains("danmu-ani")) {
            aniElement.classList.remove("danmu-ani");
            aniElement.classList.add("danmu-ani2");
            aniElement2.classList.add("danmu-ani");
        } else if (ev.target.classList.contains("danmu-ani2")) {
            clearOutDanmus(aniElement);
            aniElement.classList.remove("danmu-ani2");
            aniElement.classList.add("danmu-ani3");
        } else if (ev.target.classList.contains("danmu-ani3")) {
            clearDanmus(aniElement);
            aniElement.classList.remove("danmu-ani3");
        }
    });

    aniElement2.addEventListener("transitionend", ev => {
        if (ev.target.classList.contains("danmu-ani")) {
            aniElement2.classList.remove("danmu-ani");
            aniElement2.classList.add("danmu-ani2");
            aniElement3.classList.add("danmu-ani");
        } else if (ev.target.classList.contains("danmu-ani2")) {
            clearOutDanmus(aniElement2);
            aniElement2.classList.remove("danmu-ani2");
            aniElement2.classList.add("danmu-ani3");
        } else if (ev.target.classList.contains("danmu-ani3")) {
            clearDanmus(aniElement2);
            aniElement2.classList.remove("danmu-ani3");
        }
    });


    aniElement3.addEventListener("transitionend", ev => {
        if (ev.target.classList.contains("danmu-ani")) {
            aniElement3.classList.remove("danmu-ani");
            aniElement3.classList.add("danmu-ani2");
            aniElement.classList.add("danmu-ani");
        } else if (ev.target.classList.contains("danmu-ani2")) {
            clearOutDanmus(aniElement3);
            aniElement3.classList.remove("danmu-ani2");
            aniElement3.classList.add("danmu-ani3");
        } else if (ev.target.classList.contains("danmu-ani3")) {
            clearDanmus(aniElement3);
            aniElement3.classList.remove("danmu-ani3");
        }
    });
 

    listenerAdded = true;
}

document.getElementById("btnStart").addEventListener("click", () => {
    startAnimateDanmus();
    let count = getDanmuCount();
    startBatchDanmus(count);
});

let batchTicket = null;
function startBatchDanmus(totalCount) {
    //let count = Math.max(totalCount / 10 / 50, 1);
    let count = 1;
    batchTicket = setInterval(() => {
        for (let i = 0; i < count; i++) {
            sendDanmu("随机的弹幕消息:" + Math.random());
        }
    }, 1000);
}

document.getElementById("btnStop").addEventListener("click", () => {
    clearInterval(batchTicket);
    clearAndStop();
});

document.getElementById("btnSend").addEventListener("click", () => {
    const danmuContent = document.getElementById("danmuText").value;
    sendDanmu(danmuContent);
});

function clearAndStop() {
    aniElement.classList.remove("danmu-ani", "danmu-ani2", "danmu-ani3");
    aniElement2.classList.remove("danmu-ani", "danmu-ani2", "danmu-ani3");
    aniElement3.classList.remove("danmu-ani", "danmu-ani2", "danmu-ani3");
    clearDanmus(aniElement);
    clearDanmus(aniElement2);
    clearDanmus(aniElement3);
}

function getDanmuCount() {
    return +document.getElementById("danmuCount").value;
}

function clearDanmus(el) {
    // el.innerHTML = "";

    console.time("clearDanmus");
    el.querySelectorAll(".danmu-item:not(.hide)").forEach(child => child.classList.add("hide"));
    console.timeEnd("clearDanmus");
}

function clearOutDanmus(el) {
    return;
    // TODO::
    // requestIdleCallback(function () {
    console.time("clearOutDanmus");
    const w = pxToNumer(el.style.width);
    const childrenToDelete = el.querySelectorAll(".danmu-item:not(.hide)").forEach(child => {
        const isOut = judgeIsOut(w, child);
        child.classList.add("hide");
    });
    console.timeEnd("clearOutDanmus");

    // })

    // for (let i = childrenToDelete.length - 1; i >= 0; i--) {
    //     el.removeChild(childrenToDelete[i]);
    // }
}

function testElementWidth(tag, className) {
    const el = document.createElement(tag);
    el.className = className;
    el.innerHTML = "啊";
    el.style.cssText = "position:absolute; box-sizing: content-box;";
    document.body.appendChild(el);

    const cstyle = window.getComputedStyle(el);

    const border = pxToNumer(cstyle.borderLeftWidth) + pxToNumer(cstyle.borderRightWidth);
    const padding = pxToNumer(cstyle.paddingLeft) + pxToNumer(cstyle.paddingRight);
    const margin = pxToNumer(cstyle.marginLeft) + pxToNumer(cstyle.marginRight);
    const width = pxToNumer(cstyle.width);

    const outerWidth = border + padding + margin;
    console.log(outerWidth, width);
    document.body.removeChild(el);
    return {
        outerWidth: outerWidth,
        letterWidth: width
    };
}

let { outerWidth, letterWidth } = testElementWidth("div", "danmu-item");

function judgeIsOut(parentWidth, el) {
    return pxToNumer(el.style.left) + outerWidth + letterWidth * +el.dataset.tLength < parentWidth;
}

// setInterval(function() {
//     const total = document.querySelectorAll(".danmu-item").length;
//     const hide1 = aniElement.querySelectorAll(".hide").length;
//     const hide2 = aniElement2.querySelectorAll(".hide").length;
//     const hide3 = aniElement3.querySelectorAll(".hide").length;

//     danmuNumer.innerHTML =
//         document.querySelectorAll(".danmu-item").length + "-" + (total - hide1 - hide2 - hide3);
//     frame1Number.innerHTML =
//         aniElement.childElementCount + "-" + (aniElement.childElementCount - hide1);
//     frame2Number.innerHTML =
//         aniElement2.childElementCount + "-" + (aniElement2.childElementCount - hide2);
//     frame3Number.innerHTML =
//         aniElement3.childElementCount + "-" + (aniElement3.childElementCount - hide3);
// }, 16);

const queue = [];

function startAnimateDanmus() {
    HEIGHT = videoEl.clientHeight;
    WIDTH = videoEl.clientWidth;

    aniElement3.style.width = aniElement2.style.width = aniElement.style.width =
        videoEl.clientWidth + "px";
    aniElement3.style.height = aniElement2.style.height = aniElement.style.height =
        videoEl.clientHeight + "px";

    clearAndStop();
    startAni();
}

setInterval(() => {
    const el = document.querySelector(".danmu-ani");
    //el = currentFrameItem;

    if (!el) {
        return;
    }

    if (queue.length <= 0) {
        return;
    }

    // console.time("batchCreate");

    const poolItems = el.querySelectorAll(".danmu-item.hide");
    const poolLength = poolItems.length;

    // const x = getFrameX();
    const { x } = get2DTranslate(el);

    if (poolLength > queue.length) {
        let newItem = null;
        queue.forEach((text, index) => {
            const { top, left } = getNewTopLeft(-x);
            newItem = poolItems[index];
            newItem.classList.remove("hide");
            newItem.innerHTML = text;
            newItem.style.cssText = `left:${left}px;top:${top}px`;
        });
        // queue.splice(0);
    } else {
        const frament = document.createDocumentFragment();
        queue.map(text => createDanmuItem(text, -x)).forEach(item => frament.appendChild(item));
        el.appendChild(frament);
    }
    queue.splice(0);
    // console.timeEnd("batchCreate");
}, 16);

function getFrameX() {
    return ~~(((Date.now() - frame1StartTime) / 10000) * WIDTH);
}

function get2DTranslate(el) {
    const ts = window.getComputedStyle(el).transform;
    if (ts === "none") {
        return {
            x: 0,
            y: 0
        };
    }
    const tsl = ts.match(/matrix\((.*)\)/)[1].split(",");
    return {
        x: +tsl[4].trim(),
        y: +tsl[5].trim()
    };
}

videoEl.onplay = function() {
    // startAnimateDanmus();
};

function pxToNumer(v) {
    return +v.replace("px", "");
}

function sendDanmu(text) {
    queue.push(text);
}

const sampleEl = document.getElementById("demo_sample");
function createDanmuItem(text, left, top) {
    const { top: t, left: l } = getNewTopLeft(left, top);

    //const el = document.createElement("div");

    const el = sampleEl.cloneNode();
    el.removeAttribute("id");
    el.innerHTML = text;
    el.className = "danmu-item";
    el.dataset.tLength = text.length;
    el.style.top = t + "px";
    el.style.left = l + "px";
    return el;
}

function getNewTopLeft(left, top) {
    return {
        top: top || ~~(Math.random() * HEIGHT),
        left
    };
}

(function() {
    var script = document.createElement("script");
    script.onload = function() {
        var stats = new Stats();
        document.body.appendChild(stats.dom);
        requestAnimationFrame(function loop() {
            stats.update();
            requestAnimationFrame(loop);
        });
    };
    script.src = "//mrdoob.github.io/stats.js/build/stats.min.js";
    document.head.appendChild(script);
})();

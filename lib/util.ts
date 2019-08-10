import { ElementRect } from "./types";
const { getComputedStyle } = window;

export function pxToNumer(v: string) {
    return +v.replace("px", "");
}

export function pxToRem(pxValue, digits = 2) {
    const fontSize = pxToNumer(getComputedStyle(document.documentElement).fontSize);
    return +(pxValue / fontSize).toFixed(digits);
}

export function getRemValue() {
    return pxToNumer(getComputedStyle(document.documentElement).fontSize);
}

export function get2DTranslate(el) {
    const ts = getComputedStyle(el).transform;
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

export function getTranslateX(el: HTMLElement) {   
    const { x } = get2DTranslate(el);
    return -x;
}

export function measureElement(
    tag: string,
    className: string,
    parent: HTMLElement = document.body
): ElementRect {
    const el = document.createElement(tag);
    el.className = className;
    // 考虑letter Space
    el.innerHTML = "啊啊";
    el.style.cssText = "position:absolute; visibility:hidden";
    parent.appendChild(el);

    const cstyle = getComputedStyle(el);

    const borderWidth = pxToNumer(cstyle.borderLeftWidth) + pxToNumer(cstyle.borderRightWidth);
    const paddingWidth = pxToNumer(cstyle.paddingLeft) + pxToNumer(cstyle.paddingRight);
    const marginWidth = pxToNumer(cstyle.marginLeft) + pxToNumer(cstyle.marginRight);

    const borderHeight = pxToNumer(cstyle.borderTopWidth) + pxToNumer(cstyle.borderBottomWidth);
    const paddingHeight = pxToNumer(cstyle.paddingTop) + pxToNumer(cstyle.paddingBottom);
    const marginHeight = pxToNumer(cstyle.marginTop) + pxToNumer(cstyle.marginBottom);

    const width = pxToNumer(cstyle.width);
    const height = pxToNumer(cstyle.height);

    const outerWidth = borderWidth + paddingWidth + marginWidth;
    const outerHeight = borderHeight + paddingHeight + marginHeight;
    console.log(outerWidth, width);
    parent.removeChild(el);
    return {
        outerWidth,
        outerHeight,
        letterWidth: width / 2,
        height
    };
}

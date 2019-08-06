import { pxToNumer } from "./util";

function testElementWidth(tag: string, className: string) {
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

export default testElementWidth;

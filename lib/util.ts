export function pxToNumer(v: string) {
    return +v.replace("px", "");
}

export function pxToRem(pxValue, digits = 2) {
    const fontSize = pxToNumer(window.getComputedStyle(document.documentElement).fontSize);
    return +(pxValue / fontSize).toFixed(digits);
}

export function getRemValue() {
    return pxToNumer(window.getComputedStyle(document.documentElement).fontSize);
}

export function get2DTranslate(el) {
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
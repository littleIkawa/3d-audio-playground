// 畳み込みアプリでHRTFの角度を指定するためのフォームやcanvas要素を操作する
/**
 * 指定したidのcanvasを取得
 * @param id html要素のid
 */
const getCanvasRenderingContext2D = (id) => {
    const canvas = document.querySelector(`#${id}`);
    if (canvas !== null) {
        const ctx = canvas.getContext("2d");
        if (ctx !== null) {
            return ctx;
        }
    }
    return null;
};
/**
 * 顔っぽい線を描く
 */
const drawFaceShape = () => {
    const elevCtx = getCanvasRenderingContext2D("elev-canvas");
    if (elevCtx !== null) {
        elevCtx.beginPath();
        elevCtx.moveTo(50, 10);
        elevCtx.bezierCurveTo(40, 10, 20, 20, 20, 40);
        elevCtx.lineTo(10, 60);
        elevCtx.lineTo(18, 65);
        elevCtx.lineTo(25, 80);
        elevCtx.bezierCurveTo(30, 90, 30, 90, 50, 85);
        elevCtx.moveTo(40, 40);
        elevCtx.arc(50, 50, Math.sqrt(200), (Math.PI / 180) * -135, (Math.PI / 180) * 120);
        elevCtx.stroke();
    }
    const aziCtx = getCanvasRenderingContext2D("azi-canvas");
    if (aziCtx !== null) {
        const radius = 30.0;
        aziCtx.beginPath();
        aziCtx.arc(50, 50, radius, (Math.PI / 180) * -60, (Math.PI / 180) * 240);
        // (15 + 50, -25.98 + 50)へ移動
        aziCtx.moveTo(radius * Math.cos(-Math.PI / 3.0) + 50.0, radius * Math.sin(-Math.PI / 3.0) + 50.0);
        aziCtx.bezierCurveTo(60, 24, 60, 24, 55, 20);
        aziCtx.bezierCurveTo(50, 16, 50, 16, 45, 20);
        const target = [
            radius * Math.cos((Math.PI * 4.0) / 3.0) + 50.0,
            radius * Math.sin((Math.PI * 4.0) / 3.0) + 50.0,
        ];
        aziCtx.bezierCurveTo(40, 24, 40, 24, target[0], target[1]);
        // 耳を描く.
        // 縦軸とこの円弧の中心から交点までの角度の大きさはcos=17/18を満たす. 大体19.19度.
        const crossAngle = Math.acos(17 / 18);
        aziCtx.moveTo(10 * Math.cos((Math.PI / 180) * (-90 - crossAngle)) + 80, 10 * Math.sin((Math.PI / 180) * (90 + crossAngle)) + 50);
        aziCtx.arc(80, 50, 10, (Math.PI / 180) * (-90 - crossAngle), (Math.PI / 180) * (90 + crossAngle));
        aziCtx.moveTo(10 * Math.cos((Math.PI / 180) * (90 - crossAngle)) + 20, 10 * Math.sin((Math.PI / 180) * (270 + crossAngle)) + 50);
        aziCtx.arc(20, 50, 10, (Math.PI / 180) * (90 - crossAngle), (Math.PI / 180) * (270 + crossAngle));
        aziCtx.stroke();
    }
};
/**
 * 仰角に対し, とることができる可能な方位角のセットを返す.
 * @param elev 仰角
 */
const getAvailableAzimuthList = (elev) => {
    let delta = 5.0;
    if (Math.abs(elev) === 30) {
        delta = 6.0;
    }
    else if (Math.abs(elev) === 40) {
        delta = 6.43;
    }
    else if (elev === 50) {
        delta = 8.0;
    }
    else if (elev === 60) {
        delta = 10.0;
    }
    else if (elev === 70) {
        delta = 15.0;
    }
    else if (elev === 80) {
        delta = 30.0;
    }
    else if (elev === 90) {
        delta = 361.0;
    }
    else if (![-20, -10, 0, 10, 20].includes(elev)) {
        throw new Error("仰角が可能な値ではありません。");
    }
    const result = [];
    for (let angle = 0.0; angle < 360.0; angle += delta) {
        result.push(Math.round(angle));
    }
    return result;
};
window.addEventListener("load", () => {
    console.log(getAvailableAzimuthList(80));
    drawFaceShape();
});
export {};
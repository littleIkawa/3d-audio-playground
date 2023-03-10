// 畳み込みアプリでHRTFの角度を指定するためのフォームやcanvas要素を操作する

/**
 * 指定したidのcanvasを取得
 * @param id html要素のid
 */
const getCanvasRenderingContext2D = (
  id: string
): CanvasRenderingContext2D | null => {
  const canvas = document.querySelector<HTMLCanvasElement>(`#${id}`);
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
    elevCtx.arc(
      50,
      50,
      Math.sqrt(200),
      (Math.PI / 180) * -135,
      (Math.PI / 180) * 120
    );
    elevCtx.stroke();
  }
  const aziCtx = getCanvasRenderingContext2D("azi-canvas");
  if (aziCtx !== null) {
    const radius = 30.0;
    aziCtx.beginPath();
    aziCtx.arc(50, 50, radius, (Math.PI / 180) * -60, (Math.PI / 180) * 240);
    // (15 + 50, -25.98 + 50)へ移動
    aziCtx.moveTo(
      radius * Math.cos(-Math.PI / 3.0) + 50.0,
      radius * Math.sin(-Math.PI / 3.0) + 50.0
    );
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
    aziCtx.moveTo(
      10 * Math.cos((Math.PI / 180) * (-90 - crossAngle)) + 80,
      10 * Math.sin((Math.PI / 180) * (90 + crossAngle)) + 50
    );
    aziCtx.arc(
      80,
      50,
      10,
      (Math.PI / 180) * (-90 - crossAngle),
      (Math.PI / 180) * (90 + crossAngle)
    );
    aziCtx.moveTo(
      10 * Math.cos((Math.PI / 180) * (90 - crossAngle)) + 20,
      10 * Math.sin((Math.PI / 180) * (270 + crossAngle)) + 50
    );
    aziCtx.arc(
      20,
      50,
      10,
      (Math.PI / 180) * (90 - crossAngle),
      (Math.PI / 180) * (270 + crossAngle)
    );
    aziCtx.stroke();
  }

  const distsourceCtx = getCanvasRenderingContext2D("distance-source-canvas");
  if (distsourceCtx) {
    distsourceCtx.beginPath();
    distsourceCtx.strokeRect(0, 10, 10, 20);
    distsourceCtx.moveTo(10, 10);
    distsourceCtx.lineTo(20, 0);
    distsourceCtx.lineTo(20, 40);
    distsourceCtx.lineTo(10, 30);
    distsourceCtx.stroke();
  }
  const distListenerCtx = getCanvasRenderingContext2D(
    "distance-listener-canvas"
  );
  if (distListenerCtx) {
    distListenerCtx.beginPath();
    distListenerCtx.moveTo(20, 25);
    distListenerCtx.arc(10, 25, 10, 0, Math.PI * 2);
    distListenerCtx.stroke();
  }
};

/**
 * 仰角に対し, とることができる可能な方位角のセットを返す.
 * @param elev 仰角
 */
const getAvailableAzimuthList = (elev: number): number[] => {
  let delta = 5.0;
  if (Math.abs(elev) === 30) {
    delta = 6.0;
  } else if (Math.abs(elev) === 40) {
    delta = 6.43;
  } else if (elev === 50) {
    delta = 8.0;
  } else if (elev === 60) {
    delta = 10.0;
  } else if (elev === 70) {
    delta = 15.0;
  } else if (elev === 80) {
    delta = 30.0;
  } else if (elev === 90) {
    delta = 361.0;
  } else if (![-20, -10, 0, 10, 20].includes(elev)) {
    throw new Error("仰角が可能な値ではありません。");
  }
  const result: number[] = [];
  for (let angle = 0.0; angle < 360.0; angle += delta) {
    result.push(Math.round(angle));
  }
  return result;
};

// ラヂオボタンの縦横サイズ. 規定で13px.
const RADIO_SIZE = 13.0;
const RADIO_SIZE_HALF = RADIO_SIZE / 2.0;
// 仰角0, 方位角0の頭部中心とボタンの距離.
const BASIC_RADIUS = 80.0;
/**
 * 仰角を指定するためのラヂオボタン入力要素を生成する.
 */
const createElevSelector = () => {
  const box = document.querySelector<HTMLElement>("#elev-box");
  if (!box) {
    throw new Error("仰角指定のHTML要素が見つかりません。");
  }
  // 角度から位置のスタイル文字列を返すクロージャ
  const posStyle = (angle: number) => {
    // canvasに合わせて角度を補正し, ラジアンに合わせた角度.
    const radian = (Math.PI / 180) * (180 + angle);
    const x = BASIC_RADIUS * Math.cos(radian) + 150 - RADIO_SIZE_HALF;
    const y = BASIC_RADIUS * Math.sin(radian) + 150 - RADIO_SIZE_HALF;
    return `position:absolute;left:${x}px;top:${y}px;`;
  };
  const elevList = Array.from(Array(14).keys()).map((num) => (num - 4) * 10);
  for (const elevAngle of elevList) {
    const newInputElement = document.createElement("input");
    newInputElement.type = "radio";
    newInputElement.name = "elev-option";
    newInputElement.value = elevAngle.toString();
    if (elevAngle === 0) {
      newInputElement.checked = true;
    }
    // 仰角の各ボタンにイベントリスナを付与
    newInputElement.addEventListener("change", () => {
      onElevChange();
    });
    // これで位置を指定
    newInputElement.setAttribute("style", posStyle(elevAngle));
    box.appendChild(newInputElement);
  }
};

const getElevValue = () => {
  const elevElement = document.getElementsByName("elev-option");
  let elev = undefined;
  for (const el of elevElement) {
    if (el instanceof HTMLInputElement && el.checked) {
      elev = parseInt(el.value);
    }
  }
  if (elev === undefined) {
    throw new Error("仰角が不正です。");
  }
  return elev;
};
const getAziValue = () => {
  const aziElement = document.getElementsByName("azi-option");
  let azi = undefined;
  for (const el of aziElement) {
    if (el instanceof HTMLInputElement && el.checked) {
      azi = parseInt(el.value);
    }
  }
  if (azi === undefined) {
    throw new Error("方位角が不正です。");
  }
  return azi;
};
/**
 * [1, 10]をとる.
 */
const getDistanceValue = () => {
  const distanceElement =
    document.querySelector<HTMLInputElement>("#distance-bar");
  if (!distanceElement) {
    throw new Error("距離指定ができません。");
  }
  return parseFloat(distanceElement.value);
};

/**
 * ボックスに含まれるラヂオボタン（azi-option）をすべて消去する.
 */
const clearAziOption = () => {
  const options = document.getElementsByName("azi-option");
  const len = options.length;
  if (len === 0) {
    return;
  }
  const parent = options[0].parentNode;
  // removeの挙動的にこのようにするのが正しいらしい.
  for (let i = 0; i < len; i++) {
    parent?.removeChild(options[0]);
  }
};
/**
 * 方位角を指定するためのラヂオボタン入力要素を生成する.
 * 仰角が変更されたら生成し直すようにする.
 */
const createAziSelector = (prevAzi: number) => {
  const box = document.querySelector<HTMLElement>("#azi-box");
  if (!box) {
    throw new Error("方位角指定のHTML要素が見つかりません。");
  }
  const elev = getElevValue();
  const aziList = getAvailableAzimuthList(elev);
  // aziListの中でprevAziに最も近いものを初期値として使う.
  let defaultAzi = 0;
  let distance = 100000;
  for (const val of aziList) {
    if (Math.abs(prevAzi - val) < distance) {
      distance = Math.abs(prevAzi - val);
      defaultAzi = val;
    }
  }
  // 角度から位置のスタイル文字列を返すクロージャ
  const posStyle = (angle: number) => {
    // canvasに合わせて角度を補正し, ラジアンに合わせた角度.
    const radian = (Math.PI / 180) * (angle - 90);
    const radius = BASIC_RADIUS * Math.cos((Math.PI / 180) * elev);
    const x = radius * Math.cos(radian) + 100 - RADIO_SIZE_HALF;
    const y = radius * Math.sin(radian) + 150 - RADIO_SIZE_HALF;
    return `position:absolute;left:${x}px;top:${y}px;`;
  };
  for (const aziAngle of aziList) {
    const newInputElement = document.createElement("input");
    newInputElement.type = "radio";
    newInputElement.name = "azi-option";
    newInputElement.value = aziAngle.toString();
    if (aziAngle === defaultAzi) {
      newInputElement.checked = true;
    }
    newInputElement.addEventListener("change", () => {
      onAziChange();
    });
    newInputElement.setAttribute("style", posStyle(aziAngle));
    box.appendChild(newInputElement);
  }
};

const onElevChange = () => {
  const elev = getElevValue();
  const displayElement = document.querySelector("#elev-display");
  if (displayElement) {
    displayElement.innerHTML = elev.toString();
  }
  const prevAzi = getAziValue();
  clearAziOption();
  createAziSelector(prevAzi);
  onAziChange();
};
const onAziChange = () => {
  const azi = getAziValue();
  const displayElement = document.querySelector("#azi-display");
  if (displayElement) {
    displayElement.innerHTML = azi.toString();
  }
};
const onDistanceChanged = () => {
  const distance = getDistanceValue();
  const displayElement = document.querySelector("#distance-display");
  if (displayElement) {
    displayElement.innerHTML = distance.toString();
  }
  const canvasElement = document.querySelector<HTMLCanvasElement>(
    "#distance-source-canvas"
  );
  if (canvasElement) {
    // [1, 11]を[150, 0]にマップ
    canvasElement.style.left = ((11 - distance) * 15).toString() + "px";
  }
};

window.addEventListener("load", () => {
  drawFaceShape();
  createElevSelector();
  // イベントリスナをセットした後初期化のため一度だけ実行
  createAziSelector(0);
  onDistanceChanged();
});
document
  .querySelector<HTMLInputElement>("#distance-bar")
  ?.addEventListener("input", () => {
    onDistanceChanged();
  });

export { getElevValue, getAziValue };

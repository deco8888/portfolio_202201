// 角度をラジアンに変換
export const radians = (degrees: number): number => {
    return (degrees * Math.PI) / 180;
};

// 2点の座標の距離を求める
// ※2点間の距離の求め方：https://lab.syncer.jp/Web/JavaScript/Snippet/34/
// ■ Math.pow(x, y) ➡︎ xのy乗
// ■ Math.sqrt(x) ➡︎ xの平方根（±√x）
export const distance2d = (x1: number, y1: number, x2: number, y2: number): number => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
};

export const distance3d = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number,): number => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2) + Math.pow(z1 - z2, 2));
};

// 渡した値(value)をある範囲(start1 ~ stop1の間)から別の範囲(start2 ~ stop2の間)の相対的な位置に変換
// ・value: 変換する入力値
// ・start1: 現在の範囲の下限
// ・stop1: 現在の範囲の上限
// ・start2: 変換する範囲の下限
// ・stop2: 変換する範囲の上限
export const map = (value: number, start1: number, stop1: number, start2: number, stop2: number): number => {
    return ((value - start1) / (stop1 - start1)) * (stop2 - start2) + start2;
};

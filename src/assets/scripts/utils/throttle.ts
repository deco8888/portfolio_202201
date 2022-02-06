// throttle：連続して大量に繰り返される処理を一定感覚で間引くもの
export type Args = (...args: IArguments[]) => void;

export function throttle<F extends Args>(
    fn: F,
    delay: number
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    let lastExecTime = 0;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        // 経過時間 = 直近経過時間 - 間引きする時間
        // performance.now()：マイクロ秒単位の経過時間を取得
        // ※Date.now() とは違い、performance.now() が返す値は、常に一定の割合で増加↑
        // 初回実行の為、runTimeに代入する値は、現在時刻より前に設定
        const elapsedTime = performance.now() - lastExecTime;
        const execute = () => {
            // 関数.apply(関数の処理の対象となる要素, 関数で使う引数(配列のみ))
            fn.apply(context, args);
            lastExecTime = performance.now();
        };
        if (!timerId) {
            execute();
        }
        if (timerId) {
            clearTimeout(timerId);
        }
        if (elapsedTime > delay) {
            execute();
        } else {
            timerId = setTimeout(execute, delay);
        }
    };
}

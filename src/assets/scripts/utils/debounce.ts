// debounce：連続して大量に繰り返される処理が指定時間内に何度発生しても最後の1回だけ実行するもの
export type Args = (...args: IArguments[]) => void;

export function debounce<F extends Args>(
    fn: F,
    interval: number
): (this: ThisParameterType<F>, ...args: Parameters<F>) => void {
    let timerId: ReturnType<typeof setTimeout> | undefined;
    return function (this: ThisParameterType<F>, ...args: Parameters<F>): void {
        // debounce関数ががinterval秒内で複数呼び出されても、都度clearTimeout → 最後の1回だけ実行
        clearTimeout(timerId);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const context = this;
        timerId = setTimeout((): void => {
            fn.apply(context, args);
        }, interval);
    };
}


export function fakeDelay(ms: number): Promise<void> {
    if (typeof ms !== "number") throw new Error("[fakeDelay] MS Must be a number");

    if (ms < 0) throw new Error("[fakeDelay] MS Must be greater than 0! ");


    return new Promise<void>(r => setTimeout(() => r(), ms));


}
/**
 * AvailabilityPipeテスト
 */
import { AvailabilityPipe } from './availability.pipe';

describe('AvailabilityPipe', () => {
    it('空席あり', () => {
        const pipe = new AvailabilityPipe();
        expect(pipe).toBeTruthy();
        const result = pipe.transform(100);
        expect(result.symbol).toEqual('○');
    });

    it('空席残りわずか', () => {
        const pipe = new AvailabilityPipe();
        expect(pipe).toBeTruthy();
        const result = pipe.transform(5);
        expect(result.symbol).toEqual('△');
    });

    it('空席なし', () => {
        const pipe = new AvailabilityPipe();
        expect(pipe).toBeTruthy();
        const result = pipe.transform(0);
        expect(result.symbol).toEqual('×');
    });
});

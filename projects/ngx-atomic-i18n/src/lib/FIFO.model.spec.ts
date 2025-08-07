import { FIFOCache } from './FIFO.model';

describe('FIFOCache', () => {
    it('should set and get values', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        expect(cache.get('a')).toBe(1);
    });

    it('should evict oldest when max size exceeded', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.set('c', 3);
        expect(cache.has('a')).toBe(false);
        expect(cache.has('b')).toBe(true);
        expect(cache.has('c')).toBe(true);
    });

    it('should update value if key exists (cover line 9)', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        cache.set('a', 2); // 這裡會觸發 delete 再 set
        expect(cache.get('a')).toBe(2);
        expect(cache.size).toBe(1);
    });

    it('should delete and clear', () => {
        const cache = new FIFOCache<string, number>(2);
        cache.set('a', 1);
        cache.delete('a');
        expect(cache.has('a')).toBe(false);
        cache.set('b', 2);
        cache.clear();
        expect(cache.size).toBe(0);
    });
}); 
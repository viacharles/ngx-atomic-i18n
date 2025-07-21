import 'jest';
import { TranslationPipe } from './translate.pipe';

describe('TranslationPipe', () => {
    let pipe: TranslationPipe;
    let serviceMock: any;

    beforeEach(() => {
        serviceMock = {
            readySignal: jest.fn().mockReturnValue(true),
            t: jest.fn().mockReturnValue('translated')
        };
        Object.defineProperty(TranslationPipe.prototype, 'service', {
            get: () => serviceMock
        });
        pipe = new TranslationPipe();
    });

    it('should return translated string when ready', () => {
        expect(pipe.transform('key')).toBe('translated');
    });

    it('should return empty string when not ready', () => {
        serviceMock.readySignal.mockReturnValue(false);
        expect(pipe.transform('key')).toBe('');
    });
}); 
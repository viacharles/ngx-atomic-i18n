import 'jest';
import { TranslationPipe } from './translate.pipe';
import { TestBed } from '@angular/core/testing';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { TranslationService } from './translation.service';

describe('TranslationPipe', () => {
  let pipe: TranslationPipe;
  let serviceMock: any;
  let injector: EnvironmentInjector;

  beforeEach(() => {
    serviceMock = {
      readySignal: jest.fn().mockReturnValue(true),
      t: jest.fn().mockReturnValue('translated')
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: TranslationService, useValue: serviceMock }
      ]
    });
    injector = TestBed.inject(EnvironmentInjector);
    runInInjectionContext(injector, () => {
      pipe = new TranslationPipe();
    });
  });

  it('should return translated string when ready', () => {
    expect(pipe.transform('key')).toBe('translated');
  });

  it('should return whatever service.t returns when not ready', () => {
    jest.spyOn(serviceMock, 't').mockReturnValue('--not ready--');
    const result = pipe.transform('key');
    expect(result).toBe('--not ready--');
  });
});

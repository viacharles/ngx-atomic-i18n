import { TestBed } from '@angular/core/testing';

import { TranslationCoreService } from './translation-core.service';

describe('TranslationCoreService', () => {
  let service: TranslationCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

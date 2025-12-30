import { TestBed } from '@angular/core/testing';

import { I18nSourceService } from './i18n-source';

describe('I18nSourceService', () => {
  let service: I18nSourceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nSourceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

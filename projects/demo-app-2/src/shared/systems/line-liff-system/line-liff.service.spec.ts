import { TestBed } from '@angular/core/testing';

import { LineLiffService } from './line-liff.service';

describe('LineLiffService', () => {
  let service: LineLiffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LineLiffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

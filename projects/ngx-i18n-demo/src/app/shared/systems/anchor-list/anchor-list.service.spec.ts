import { TestBed } from '@angular/core/testing';

import { AnchorListService } from './anchor-list.service';

describe('AnchorListService', () => {
  let service: AnchorListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnchorListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceDialog } from './source-dialog';

describe('SourceDialog', () => {
  let component: SourceDialog;
  let fixture: ComponentFixture<SourceDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

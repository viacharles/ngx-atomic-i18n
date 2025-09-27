import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarningDialogComponent } from './warning-dialog.component';

describe('WarningDialogComponent', () => {
  let component: WarningDialogComponent;
  let fixture: ComponentFixture<WarningDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WarningDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarningDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

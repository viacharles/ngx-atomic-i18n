import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownDialogComponent } from './dropdown-dialog.component';

describe('DropdownDialogComponent', () => {
  let component: DropdownDialogComponent;
  let fixture: ComponentFixture<DropdownDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DropdownDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

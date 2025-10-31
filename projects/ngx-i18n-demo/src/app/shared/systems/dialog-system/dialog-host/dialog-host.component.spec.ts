import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogHostComponent } from './dialog-host.component';

describe('DialogHostComponent', () => {
  let component: DialogHostComponent;
  let fixture: ComponentFixture<DialogHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogHostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

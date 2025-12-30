import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToastHostComponent } from './toast-host';

describe('ToastHostComponent', () => {
  let component: ToastHostComponent;
  let fixture: ComponentFixture<ToastHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastHostComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(ToastHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

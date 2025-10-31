import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorTextComponent } from './error-text.component';

describe('ErrorTextComponent', () => {
  let component: ErrorTextComponent;
  let fixture: ComponentFixture<ErrorTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorTextComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

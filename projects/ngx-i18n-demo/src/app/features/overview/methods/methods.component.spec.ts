import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MethodsComponent } from './methods.component';

describe('MethodsComponent', () => {
  let component: MethodsComponent;
  let fixture: ComponentFixture<MethodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MethodsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(MethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

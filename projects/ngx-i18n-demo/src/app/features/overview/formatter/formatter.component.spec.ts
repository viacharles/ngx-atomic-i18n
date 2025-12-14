import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatterComponent } from './formatter.component';

describe('FormatterComponent', () => {
  let component: FormatterComponent;
  let fixture: ComponentFixture<FormatterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormatterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormatterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

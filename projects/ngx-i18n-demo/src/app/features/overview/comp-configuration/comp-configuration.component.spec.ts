import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompConfigurationComponent } from './comp-configuration.component';

describe('CompConfigurationComponent', () => {
  let component: CompConfigurationComponent;
  let fixture: ComponentFixture<CompConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompConfigurationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

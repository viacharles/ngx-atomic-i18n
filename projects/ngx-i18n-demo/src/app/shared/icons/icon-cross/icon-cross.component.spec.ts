import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconCrossComponent } from './icon-cross.component';

describe('IconCrossComponent', () => {
  let component: IconCrossComponent;
  let fixture: ComponentFixture<IconCrossComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconCrossComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconCrossComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

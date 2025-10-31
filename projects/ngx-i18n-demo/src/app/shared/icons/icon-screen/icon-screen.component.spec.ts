import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconScreenComponent } from './icon-screen.component';

describe('IconScreenComponent', () => {
  let component: IconScreenComponent;
  let fixture: ComponentFixture<IconScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IconScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

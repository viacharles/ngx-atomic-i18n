import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FootNavigationComponent } from './foot-navigation.component';

describe('FootNavigationComponent', () => {
  let component: FootNavigationComponent;
  let fixture: ComponentFixture<FootNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FootNavigationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FootNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

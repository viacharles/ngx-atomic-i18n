import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnchorListItemComponent } from './anchor-list-item.component';

describe('AnchorListItemComponent', () => {
  let component: AnchorListItemComponent;
  let fixture: ComponentFixture<AnchorListItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnchorListItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnchorListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

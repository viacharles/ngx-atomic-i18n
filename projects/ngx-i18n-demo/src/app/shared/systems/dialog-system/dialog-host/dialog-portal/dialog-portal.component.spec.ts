import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogPortalComponent } from './dialog-portal.component';

describe('DialogPortalComponent', () => {
  let component: DialogPortalComponent;
  let fixture: ComponentFixture<DialogPortalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogPortalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DialogPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

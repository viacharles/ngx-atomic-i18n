import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideMenuPageDialogComponent } from './side-menu-page-dialog.component';

describe('SideMenuPageDialogComponent', () => {
  let component: SideMenuPageDialogComponent;
  let fixture: ComponentFixture<SideMenuPageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideMenuPageDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideMenuPageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

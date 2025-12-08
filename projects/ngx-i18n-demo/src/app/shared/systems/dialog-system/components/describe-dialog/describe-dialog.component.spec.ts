import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescribeDialogComponent } from './describe-dialog.component';

describe('DescribeDialogComponent', () => {
  let component: DescribeDialogComponent;
  let fixture: ComponentFixture<DescribeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DescribeDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescribeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

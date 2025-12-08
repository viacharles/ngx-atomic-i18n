import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TsToJsonComponent } from './ts-to-json.component';

describe('TsToJsonComponent', () => {
  let component: TsToJsonComponent;
  let fixture: ComponentFixture<TsToJsonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TsToJsonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TsToJsonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

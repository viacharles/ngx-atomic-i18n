import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmitI18nJsonAssetsComponent } from './emit-i18n-json-assets.component';

describe('EmitI18nJsonAssetsComponent', () => {
  let component: EmitI18nJsonAssetsComponent;
  let fixture: ComponentFixture<EmitI18nJsonAssetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmitI18nJsonAssetsComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(EmitI18nJsonAssetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

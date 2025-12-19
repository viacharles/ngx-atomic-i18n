import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser'; // 導入 By
import { TranslationDirective } from './translation.directive';
import { TranslationService } from './translation.service';
import { Params } from './translate.type';

// ---
// 1. 創建一個模擬的 TranslationService
// ---
class MockTranslationService {
  // 模擬 t() 方法，使其返回一個可預測的值
  t = jest.fn((key: string, params?: Params) => {
    if (key === '') return '';  // 這樣才會跟你測試期望一致
    if (key === 'hello') {
      return params && params['name'] ? `Hello, ${params['name']}!` : 'Hello!';
    }
    if (key === 'welcome') {
      return 'Welcome to our app!';
    }
    return `Translated: ${key}`; // 預設返回值
  });
}

// ---
// 2. 修正 HostComponent，使其使用正確的 selector [t]
//    並提供輸入屬性來測試 Directive 的行為
// ---
@Component({
  template: `
    <div [t]="translationKey" [tParams]="translationParams"></div>
    <span [t]="attrKey" [tAttr]="'title'"></span>
    <p [t]="emptyT" [tParams]="emptyTParams"></p>
  `,
  imports: [TranslationDirective],
  standalone: true
})
class HostComponent {
  translationKey = '';
  translationParams?: Params;
  attrKey = '';
  emptyT = '';
  emptyTParams?: Params;
}

describe('TranslationDirective', () => {
  let fixture: ComponentFixture<HostComponent>;
  let mockTranslationService: MockTranslationService;

  beforeEach(() => {
    mockTranslationService = new MockTranslationService();

    TestBed.configureTestingModule({
      imports: [HostComponent, TranslationDirective],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks(); // 每個 it 都 reset mock
  });

  // ---
  // 基礎測試：確保 Directive 實例被成功建立
  // ---
  it('should create an instance', () => {
    const divElem = fixture.nativeElement.querySelector('div');
    expect(divElem).toBeTruthy();
    const debugElem = fixture.debugElement.query(By.directive(TranslationDirective));
    expect(debugElem).toBeTruthy();
  });

  // ---
  // 測試文字內容翻譯
  // ---
  it('should translate and set textContent', () => {
    const hostComponent = fixture.componentInstance;
    const divElement = fixture.nativeElement.querySelector('div'); // 確保找到帶有 [t] 的 div

    // 1. 測試沒有參數的翻譯
    hostComponent.translationKey = 'welcome';
    fixture.detectChanges();
    // 注意：toHaveBeenCalledWith 會清除上一次呼叫的記錄，
    // 所以在這個單一測試案例中，我們只關注當前的呼叫。
    expect(mockTranslationService.t).toHaveBeenCalledWith('welcome', undefined);
    expect(divElement.textContent).toBe('Welcome to our app!');

    // 重置 mock 呼叫記錄，以便下一次斷言只關注當前行為
    mockTranslationService.t.mockClear();

    // 2. 測試帶有參數的翻譯
    hostComponent.translationKey = 'hello';
    hostComponent.translationParams = { name: 'World' };
    fixture.detectChanges();
    expect(mockTranslationService.t).toHaveBeenCalledWith('hello', { name: 'World' });
    expect(divElement.textContent).toBe('Hello, World!');
  });

  // ---
  // 測試屬性翻譯 (tAttr)
  // ---
  it('should translate and set attribute', () => {
    const hostComponent = fixture.componentInstance;
    const spanElement = fixture.nativeElement.querySelector('span'); // 確保找到帶有 [t] 的 span

    hostComponent.attrKey = 'custom_title';
    fixture.detectChanges();
    expect(mockTranslationService.t).toHaveBeenCalledWith('custom_title', undefined);
    expect(spanElement.getAttribute('title')).toBe('Translated: custom_title');

    mockTranslationService.t.mockClear();

    // 測試改變 tAttr 值，再次觸發
    hostComponent.attrKey = 'another_attr';
    fixture.detectChanges();
    expect(mockTranslationService.t).toHaveBeenCalledWith('another_attr', undefined);
    expect(spanElement.getAttribute('title')).toBe('Translated: another_attr');
  });

  // ---
  // 測試 t() 參數為空字串或 undefined 的情況
  // ---
  it('should handle empty translation key gracefully', () => {
    const hostComponent = fixture.componentInstance;
    const pElement = fixture.nativeElement.querySelector('p'); // 確保找到帶有 [t] 的 p

    hostComponent.emptyT = ''; // 空字串
    hostComponent.emptyTParams = undefined;
    fixture.detectChanges();
    expect(mockTranslationService.t).toHaveBeenCalledWith('', undefined);
    expect(pElement.textContent).toBe(''); // 根據 MockTranslationService.t 的實現
  });

  // ---
  // 測試當 t 或 tParams 變化時，effect 是否重新執行
  // ---
  it('should re-evaluate effect when inputs change', () => {
    const hostComponent = fixture.componentInstance;
    const divElement = fixture.nativeElement.querySelector('div'); // 確保找到帶有 [t] 的 div

    // 清除所有 mock 呼叫記錄，以便從這個測試案例的起點計算
    mockTranslationService.t.mockClear();

    // 初始設置
    hostComponent.translationKey = 'initial';
    fixture.detectChanges();
    expect(mockTranslationService.t).toHaveBeenCalledTimes(1);
    expect(mockTranslationService.t).toHaveBeenCalledWith('initial', undefined);
    expect(divElement.textContent).toBe('Translated: initial');

    mockTranslationService.t.mockClear(); // 清除以便下次計算

    // 改變 t
    hostComponent.translationKey = 'changed';
    fixture.detectChanges();
    expect(mockTranslationService.t).toHaveBeenCalledTimes(1);
    expect(mockTranslationService.t).toHaveBeenCalledWith('changed', undefined);
    expect(divElement.textContent).toBe('Translated: changed');

    mockTranslationService.t.mockClear(); // 清除以便下次計算

    // 改變 tParams (即使 t 不變)
    hostComponent.translationKey = 'hello'; // 保持 key 不變
    hostComponent.translationParams = { name: 'Alice' };
    fixture.detectChanges();
    expect(mockTranslationService.t).toHaveBeenCalledTimes(1);
    expect(mockTranslationService.t).toHaveBeenCalledWith('hello', { name: 'Alice' });
    expect(divElement.textContent).toBe('Hello, Alice!');
  });
});

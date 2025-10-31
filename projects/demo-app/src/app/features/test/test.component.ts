import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast.service';
import { TranslationPipe } from '../../../../../ngx-i18n/src/public-api';

@Component({
  selector: 'app-test',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslationPipe],
  template: `
    <div class="test-container">
      <h2>{{ 'test.title' | t }}</h2>

      <div class="test-section">
        <h3>{{ 'test.pipe_lifecycle' | t }}</h3>

        <div class="lifecycle-test">
          <div class="test-controls">
            <button (click)="togglePipeTest()" class="btn btn-primary">
              {{ showPipeTest ? '隱藏' : '顯示' }} Pipe 測試
            </button>
            <button (click)="changeTestKey()" class="btn btn-secondary">
              變更測試 Key
            </button>
            <button (click)="changeTestParams()" class="btn btn-warning">
              變更測試參數
            </button>
            <button (click)="clearLogs()" class="btn btn-danger">
              清除日誌
            </button>
            <button (click)="testKeyChange()" class="btn btn-info">
              測試 Key 變動
            </button>
          </div>

          <div class="test-display" *ngIf="showPipeTest">
            <div class="pipe-test-item">
              <h4>測試 Key: {{ testKey }}</h4>
              <p><strong>翻譯結果:</strong> {{ testKey | t: testParams }}</p>
            </div>

            <div class="pipe-test-item">
              <h4>參數測試 (點擊「變更測試參數」查看效果)</h4>
              <p><strong>問候語:</strong> {{ 'greeting' | t: { name: testParams.name || 'World' } }}</p>
              <p><strong>數量:</strong> {{ 'test.items' | t: { count: testParams.count || 0 } }}</p>
              <p><strong>自定義訊息:</strong> {{ 'test.custom_message' | t: { user: testParams.name || 'User', count: testParams.count || 0 } }}</p>
            </div>

            <div class="pipe-test-item">
              <h4>動態參數測試</h4>
              <p><strong>數量:</strong> {{ 'test.items' | t: { count: dynamicCount } }}</p>
              <p><strong>問候:</strong> {{ 'greeting' | t: { name: dynamicName } }}</p>
            </div>

            <div class="pipe-test-item">
              <h4>計數器測試 (應該觸發 pipe 重新計算)</h4>
              <p><strong>計數:</strong> {{ 'test.amount' | t: { count: count } }}</p>
              <p><strong>當前計數值:</strong> {{ count }}</p>
            </div>
          </div>

          <div class="logs-container">
            <h4>Pipe 生命週期日誌:</h4>
            <div class="logs" #logsContainer>
              <div *ngFor="let log of logs" class="log-item" [class]="log.type">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-message">{{ log.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="test-section">
        <h3>{{ 'test.dynamic_params' | t }}</h3>

        <div class="param-test">
          <div class="param-display">
            <label>{{ 'test.current_value' | t }}:</label>
            <span class="value">{{ count }}</span>
          </div>

          <div class="param-controls">
            <button (click)="decrement()" class="btn btn-secondary">
              {{ 'test.decrease' | t }}
            </button>
            <button (click)="increment()" class="btn btn-primary">
              {{ 'test.increase' | t }}
            </button>
            <button (click)="reset()" class="btn btn-warning">
              {{ 'test.reset' | t }}
            </button>
          </div>

          <div class="translation-result">
            <h4>{{ 'test.translation_result' | t }}:</h4>
            <div class="result-box">
              <p><strong>{{ 'test.amount' | t: { count: count } }}</strong></p>
              <p><strong>{{ 'test.items' | t: { count: count } }}</strong></p>
              <p><strong>{{ 'test.people' | t: { count: count } }}</strong></p>
            </div>
          </div>
        </div>
      </div>

      <div class="test-section">
        <h3>{{ 'test.interpolation_test' | t }}</h3>

        <div class="input-group">
          <label for="nameInput">{{ 'test.enter_name' | t }}:</label>
          <input
            id="nameInput"
            type="text"
            [(ngModel)]="userName"
            placeholder="{{ 'test.name_placeholder' | t }}"
            class="form-input"
          >
        </div>

        <div class="translation-result">
          <h4>{{ 'test.greeting_result' | t }}:</h4>
          <div class="result-box">
            <p><strong>{{ 'greeting' | t: { name: userName || 'World' } }}</strong></p>
          </div>
        </div>
      </div>

      <div class="test-section">
        <h3>{{ 'test.toast_test' | t }}</h3>

        <div class="toast-buttons">
          <button (click)="showSuccessToast()" class="btn btn-success">
            {{ 'test.show_success' | t }}
          </button>
          <button (click)="showErrorToast()" class="btn btn-danger">
            {{ 'test.show_error' | t }}
          </button>
          <button (click)="showWarningToast()" class="btn btn-warning">
            {{ 'test.show_warning' | t }}
          </button>
          <button (click)="showInfoToast()" class="btn btn-info">
            {{ 'test.show_info' | t }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h2 {
      color: #333;
      margin-bottom: 2rem;
      text-align: center;
    }

    .test-section {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border: 1px solid #e9ecef;
    }

    h3 {
      color: #495057;
      margin-bottom: 1rem;
      border-bottom: 2px solid #007bff;
      padding-bottom: 0.5rem;
    }

    .lifecycle-test {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .test-controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 1rem;
    }

    .test-display {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #dee2e6;
      margin-bottom: 1rem;
    }

    .pipe-test-item {
      margin-bottom: 1rem;
      padding: 0.5rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .pipe-test-item h4 {
      margin: 0 0 0.5rem 0;
      color: #495057;
    }

    .logs-container {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .logs {
      max-height: 300px;
      overflow-y: auto;
      background: #f8f9fa;
      border-radius: 4px;
      padding: 0.5rem;
    }

    .log-item {
      display: flex;
      gap: 1rem;
      padding: 0.25rem 0;
      font-family: monospace;
      font-size: 0.875rem;
      border-bottom: 1px solid #e9ecef;
    }

    .log-item:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #6c757d;
      min-width: 80px;
    }

    .log-message {
      flex: 1;
    }

    .log-item.create {
      color: #28a745;
    }

    .log-item.destroy {
      color: #dc3545;
    }

    .log-item.effect {
      color: #007bff;
    }

    .log-item.computed {
      color: #6f42c1;
    }

    .log-item.transform {
      color: #fd7e14;
    }

    .param-test {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .param-display {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: white;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .value {
      font-size: 1.5rem;
      font-weight: bold;
      color: #007bff;
      min-width: 3rem;
      text-align: center;
    }

    .param-controls {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .input-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .form-input {
      padding: 0.5rem;
      border: 1px solid #ced4da;
      border-radius: 4px;
      font-size: 1rem;
    }

    .form-input:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
    }

    .translation-result {
      background: white;
      padding: 1rem;
      border-radius: 6px;
      border: 1px solid #dee2e6;
    }

    .result-box {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 4px;
      border-left: 4px solid #007bff;
    }

    .result-box p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
    }

    .toast-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: all 0.2s ease;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background: #e0a800;
    }

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-success:hover {
      background: #1e7e34;
    }

    .btn-danger {
      background: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background: #c82333;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-info:hover {
      background: #138496;
    }
  `]
})
export class TestComponent implements OnInit, OnDestroy {
  count = 0;
  userName = '';
  showPipeTest = false;
  testKey = 'test.pipe_lifecycle';
  testParams: { test: string; count?: number; name?: string } = {
    test: 'initial',
    count: 0,
    name: 'World'
  };
  dynamicCount = 1;
  dynamicName = 'Test User';
  logs: Array<{ time: string; message: string; type: string }> = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.addLog('Component 初始化', 'create');
  }

  ngOnDestroy(): void {
    this.addLog('Component 銷毀', 'destroy');
  }

  togglePipeTest(): void {
    this.showPipeTest = !this.showPipeTest;
    this.addLog(`Pipe 測試 ${this.showPipeTest ? '顯示' : '隱藏'}`, 'transform');
  }

  changeTestKey(): void {
    const keys = ['test.pipe_lifecycle', 'test.dynamic_params', 'test.interpolation_test', 'welcome'];
    const currentIndex = keys.indexOf(this.testKey);
    const nextIndex = (currentIndex + 1) % keys.length;
    this.testKey = keys[nextIndex];
    this.addLog(`測試 Key 變更為: ${this.testKey}`, 'transform');
  }

  changeTestParams(): void {
    this.testParams = {
      test: `param_${Date.now()}`,
      count: Math.floor(Math.random() * 100),
      name: `User_${Math.floor(Math.random() * 1000)}`
    };
    this.addLog(`測試參數變更為: ${JSON.stringify(this.testParams)}`, 'transform');
  }

  clearLogs(): void {
    this.logs = [];
    this.addLog('日誌已清除', 'transform');
  }

  private addLog(message: string, type: string): void {
    const time = new Date().toLocaleTimeString();
    this.logs.push({ time, message, type });

    // 保持最多 50 條日誌
    if (this.logs.length > 50) {
      this.logs.shift();
    }
  }

  increment(): void {
    this.count++;
    this.addLog(`計數增加: ${this.count}`, 'computed');
  }

  decrement(): void {
    this.count--;
    this.addLog(`計數減少: ${this.count}`, 'computed');
  }

  reset(): void {
    this.count = 0;
    this.addLog('計數重置', 'computed');
  }

  showSuccessToast(): void {
    this.toastService.success('操作成功！');
  }

  showErrorToast(): void {
    this.toastService.error('發生錯誤！');
  }

  showWarningToast(): void {
    this.toastService.warning('請注意！');
  }

  showInfoToast(): void {
    this.toastService.info('提示訊息');
  }

  testKeyChange(): void {
    this.changeTestKey();
  }
}

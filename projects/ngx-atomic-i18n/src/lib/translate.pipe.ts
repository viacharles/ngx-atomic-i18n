import { effect, inject, OnDestroy, Pipe, PipeTransform, signal } from "@angular/core";
import { Params } from "./translate.type";
import { TranslationService } from "./translation.service";
import { Subscription } from "rxjs";
import { TranslationCoreService } from "./translation-core.service";

let globalCount = 0;
let instanceId = 0;

@Pipe({ name: 't', standalone: true, pure: true })
export class TranslationPipe implements PipeTransform, OnDestroy {
    private readonly service = inject(TranslationService);
    private readonly core = inject(TranslationCoreService);
    private readonly instanceId = ++instanceId;

    private currentKey = '';
    private currentParams: Params | undefined = undefined;
    private lastResult = '';

    test = signal(0);
    private subscription = new Subscription();

    constructor() {
        globalCount++;
        if (this.instanceId === 33 || this.instanceId === 34 || this.instanceId === 35) {
            console.log(`🧪 [Pipe ${this.instanceId}] TranslationPipe instance created. Total instances: ${globalCount}`);
        }

        this.test.update(c => c + 1);

        effect(() => {
            this.test();
            if (this.instanceId === 33 || this.instanceId === 34 || this.instanceId === 35) {
                console.log(`🧪 [Pipe ${this.instanceId}] effect triggered - test value: ${this.test()}`);
            }
        });
    }

    transform(key: string, params?: Params): string {
        if (this.instanceId >= 30 && this.instanceId <= 40) {
            console.log(`🧪 [Pipe ${this.instanceId}] transform method called - key: ${key}, params:`, params);
        }

        // 檢查 key 和 params 是否改變
        const keyChanged = this.currentKey !== key;
        const paramsChanged = JSON.stringify(this.currentParams) !== JSON.stringify(params);

        if (keyChanged || paramsChanged) {
            if (this.instanceId >= 30 && this.instanceId <= 40) {
                console.log(`🧪 [Pipe ${this.instanceId}] parameters changed - key: ${this.currentKey} -> ${key}, params changed: ${paramsChanged}`);
            }

            this.currentKey = key;
            this.currentParams = params;

            // 直接調用 service 進行翻譯
            this.lastResult = this.service.instant(key, params);

            if (this.instanceId >= 30 && this.instanceId <= 40) {
                console.log(`🧪 [Pipe ${this.instanceId}] translation result: ${this.lastResult}`);
            }
        } else {
            if (this.instanceId >= 30 && this.instanceId <= 40) {
                console.log(`🧪 [Pipe ${this.instanceId}] parameters unchanged, returning cached result: ${this.lastResult}`);
            }
        }

        return this.lastResult;
    }

    ngOnDestroy(): void {
        globalCount--;
        if (this.instanceId === 33 || this.instanceId === 34 || this.instanceId === 35) {
            console.log(`🧪 [Pipe ${this.instanceId}] TranslationPipe instance destroyed. Remaining instances: ${globalCount}`);
        }
        this.subscription.unsubscribe();
    }
}
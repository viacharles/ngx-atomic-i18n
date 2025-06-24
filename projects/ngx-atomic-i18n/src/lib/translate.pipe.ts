import { inject, OnDestroy, Pipe, PipeTransform } from "@angular/core";
import { Params } from "./translate.type";
import { TranslationService } from "./translation.service";
import { Subscription } from "rxjs";

let globalCount = 0;
let instanceId = 0;

@Pipe({ name: 't', standalone: true, pure: false })
export class TranslationPipe implements PipeTransform, OnDestroy {
    private readonly service = inject(TranslationService);
    private readonly instanceId = ++instanceId;

    private subscription = new Subscription();

    constructor() {
        globalCount++;
        if (this.instanceId === 33 || this.instanceId === 34 || this.instanceId === 35) {
            console.log(`🧪 [Pipe ${this.instanceId}] TranslationPipe instance created. Total instances: ${globalCount}`);
        }

    }

    transform(key: string, params?: Params): string {
        if (this.service.getNskey === 'zh-Hant:setting') {
            console.log(`🧪 [Pipe ${this.instanceId}] transform method called - key: ${key}, params:`, params, this.service.translateSignal(key, params)());
        }

        return this.service.translateSignal(key, params)();
    }

    ngOnDestroy(): void {
        globalCount--;
        if (this.instanceId === 33 || this.instanceId === 34 || this.instanceId === 35) {
            console.log(`🧪 [Pipe ${this.instanceId}] TranslationPipe instance destroyed. Remaining instances: ${globalCount}`);
        }
        this.subscription.unsubscribe();
    }
}
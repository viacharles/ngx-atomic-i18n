import { forwardRef, Provider, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const getCustomNgFormProvider = (component: any): Provider => {
  return {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => component),
    multi: true,
  };
};

export abstract class CustomNgForm implements ControlValueAccessor {
  valueSig = signal<string | null>(null);
  get value() { return this.valueSig(); }
  set value(val) {
    this.valueSig.set(val);
    this.onChange(val);
  }
  protected onChange = (value: string | null) => { };
  protected onTouched = () => { };
  writeValue(value: string | null): void {
    this.valueSig.set(value);
  }
  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void { }
}

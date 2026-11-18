import {Component, forwardRef, Input} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'app-checkbox-group',
  standalone: true,
  templateUrl: './checkbox-group.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CheckboxGroupComponent),
    multi: true
  }]
})
export class CheckboxGroupComponent implements ControlValueAccessor {
  @Input() options: readonly string[] = [];

  value: string[] = [];
  disabled = false;

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string[] | null): void {
    this.value = value ? [...value] : [];
  }

  registerOnChange(fn: (value: string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  toggle(option: string, checked: boolean): void {
    if (this.disabled) {
      return;
    }

    if (checked) {
      this.value = [...this.value, option];
    } else {
      this.value = this.value.filter(v => v !== option);
    }

    this.onChange(this.value);
    this.onTouched();
  }
}

import {Directive, HostBinding, inject} from '@angular/core';
import {NgControl} from '@angular/forms';

@Directive({
  selector: '[formControlName].form-control, [formControl].form-control'
})
export class BootstrapFormValidationDirective {
  private readonly ngControl = inject(NgControl);

  @HostBinding('class.is-invalid')
  get isInvalid(): boolean {
    const control = this.ngControl.control;
    return !!control
      && control.invalid
      && (control.touched || control.dirty);
  }

  @HostBinding('class.is-valid')
  get isValid(): boolean {
    const control = this.ngControl.control;
    return !!control
      && control.valid
      && (control.touched || control.dirty);
  }
}

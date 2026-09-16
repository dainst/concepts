import {Component, input, output} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import {GeographicalExtend} from 'concepts-common/interfaces/concept';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {getIssues} from '@placemarkio/check-geojson';
import {JsonPipe, KeyValuePipe} from '@angular/common';
import {NgbAlert} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-geographic-extend',
  imports: [
    BootstrapFormValidationDirective,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    KeyValuePipe,
    NgbAlert
  ],
  templateUrl: './edit-geographical-extend.component.html',
  styleUrl: './edit-geographical-extend.component.css',
})
export class EditGeographicalExtend {
  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      centerLat: FormControl<number>;
      centerLng: FormControl<number>;
      shape: FormControl<string>;
      certainty: FormControl<number>;
      precision: FormControl<number>;
      id: FormControl<string>
    }>
  >();

  static isValidGeoJSON = (control: AbstractControl): ValidationErrors | null => {
    const issues = getIssues(control.value);
    if (issues.length) {
      return {invalidGeoJSON: issues.map(i => i.message)};
    }
    return null;
  }

  static value2Form = (fb: NonNullableFormBuilder, ge: GeographicalExtend|undefined = undefined) =>
    fb.group({
      centerLat: [0, [Validators.min(-90), Validators.max(90)]], // TODO x parseGeOJson, validators
      centerLng: [0, [Validators.min(-180), Validators.max(180)]], // TODO x parseGeOJson, validators
      shape: [ge?.shape || '', EditGeographicalExtend.isValidGeoJSON],
      certainty: [ge?.certainty || 100, [Validators.min(-0), Validators.max(100)]],
      precision: [ge?.precision || 100, [Validators.min(-0), Validators.max(100)]],
      id: [ge?.id ?? ''],
    });

  static form2Value = (
    ge: ReturnType<ReturnType<typeof EditGeographicalExtend.value2Form>['getRawValue']>): GeographicalExtend =>
      ({
        center: `WKT string: ${ge.centerLat} ${ge.centerLng}`,
        certainty: ge.certainty,
        precision: ge.precision,
        shape: ge.shape,
        ...{id: ge.id ? ge.id : undefined}
      });

  protected formatJSON() {
    const v = this.form().controls.shape.getRawValue();
    const w = JSON.parse(v);
    const x = JSON.stringify(w, null, 2);
    this.form().controls.shape.setValue(x);
  }
}

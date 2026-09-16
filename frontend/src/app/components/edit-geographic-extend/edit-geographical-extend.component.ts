import {Component, inject, input, output} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {GeographicalExtend} from 'concepts-common/interfaces/concept';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';

@Component({
  selector: 'app-edit-geographic-extend',
  imports: [
    BootstrapFormValidationDirective,
    FormsModule,
    ReactiveFormsModule
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

  static value2Form = (fb: NonNullableFormBuilder, ge: GeographicalExtend|undefined = undefined) =>
    fb.group({
      centerLat: [0, [Validators.min(-90), Validators.max(90)]], // TODO x parseGeOJson, validators
      centerLng: [0, [Validators.min(-180), Validators.max(180)]], // TODO x parseGeOJson, validators
      shape: [ge?.shape || ''],
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
}

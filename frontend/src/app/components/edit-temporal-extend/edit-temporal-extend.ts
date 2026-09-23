import {Component, input, output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {TemporalExtend} from 'concepts-common/interfaces/concept';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';

@Component({
  selector: 'app-edit-temporal-extend',
  imports: [
    BootstrapFormValidationDirective,
    ReactiveFormsModule
  ],
  templateUrl: './edit-temporal-extend.html',
  styleUrl: './edit-temporal-extend.css'
})
export class EditTemporalExtend {
  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      startMin: FormControl<number>;
      startMax: FormControl<number>;
      startCertainty: FormControl<number>;
      startPrecision: FormControl<number>;
      endMin: FormControl<number>;
      endMax: FormControl<number>;
      endCertainty: FormControl<number>;
      endPrecision: FormControl<number>;
      id: FormControl<string>
    }>
  >();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static value2Form = (fb: NonNullableFormBuilder, te: TemporalExtend|undefined = undefined) => {
    return fb.group({
      startMin: [te?.start.min || 100],
      startMax: [te?.start.max || 100],
      startCertainty: [te?.start.certainty || 100, [Validators.min(0), Validators.max(100)]],
      startPrecision: [te?.start.precision || 100, [Validators.min(0), Validators.max(100)]],
      endMin: [te?.end.min || 100],
      endMax: [te?.end.max || 100],
      endCertainty: [te?.end.certainty || 100, [Validators.min(0), Validators.max(100)]],
      endPrecision: [te?.end.precision || 100, [Validators.min(0), Validators.max(100)]],
      id: [te?.id ?? '']
    });
  };

  static form2Value = (
    te: ReturnType<ReturnType<typeof EditTemporalExtend.value2Form>['getRawValue']>
  ): TemporalExtend =>
    ({
      start: {
        precision: te.startPrecision,
        certainty: te.startCertainty,
        min: te.startMin,
        max: te.startMax
      },
      end: {
        precision: te.endPrecision,
        certainty: te.endCertainty,
        min: te.endMin,
        max: te.endMax
      },
      ...{id: te.id ? te.id : undefined}
    });
}

import {Component, input, output} from '@angular/core';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {FormControl, FormGroup, FormsModule, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {Source} from 'concepts-common/interfaces/concept';

@Component({
  selector: 'app-edit-source',
  imports: [
    BootstrapFormValidationDirective,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './edit-source.html',
  styleUrl: './edit-source.css'
})
export class EditSource {
  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      reference: FormControl<string>;
    }>
  >();

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static value2Form = (fb: NonNullableFormBuilder, s: Source|undefined = undefined) => {
    console.log('BBBB', s)
    return fb.group({
      reference: [s?.reference ?? '']
    });
  };

  static form2Value = (
    r: ReturnType<ReturnType<typeof EditSource.value2Form>['getRawValue']>
  ): Source => ({
    reference: r.reference
  });
}

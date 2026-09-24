import {Component, input, output} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule, ValidationErrors
} from '@angular/forms';
import {ConceptId, RelationWithOutSubject} from 'concepts-common/interfaces/concept';
import {SelectConcept} from '../select-concept/select-concept';
import {isConceptId} from 'concepts-common/functions/concept.typeguards';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';

@Component({
  selector: 'app-edit-relation',
  imports: [
    ReactiveFormsModule,
    SelectConcept,
    BootstrapFormValidationDirective
  ],
  templateUrl: './edit-relation.component.html',
  styleUrl: './edit-relation.component.css'
})
export class EditRelation {
  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      predicate: FormControl<ConceptId>;
      object: FormControl<ConceptId>;
    }>
  >();

  private static validConcept
    = (control: AbstractControl<ConceptId|string>): ValidationErrors | null =>
   isConceptId(control.value) && !!control.value.id && !!control.value.type ? null : {invalidConcept: true};

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static value2Form = (fb: NonNullableFormBuilder, r: RelationWithOutSubject|undefined = undefined) => {
    return fb.group({
      predicate: [r?.predicate ?? {id: '', type: ''}, EditRelation.validConcept],
      object: [r?.object ?? {id: '', type: ''}, EditRelation.validConcept]
    });
  };

  static form2Value = (
    r: ReturnType<ReturnType<typeof EditRelation.value2Form>['getRawValue']>
  ): RelationWithOutSubject =>
    ({
      predicate: r.predicate,
      object: r.object
    });
}

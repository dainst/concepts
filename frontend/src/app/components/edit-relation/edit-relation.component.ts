import {Component, input, output} from '@angular/core';
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule} from '@angular/forms';
import {ConceptId, Relation} from 'concepts-common/interfaces/concept';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {SelectConceptComponent} from '../select-concept/select-concept';

@Component({
  selector: 'app-edit-relation',
  imports: [
    BootstrapFormValidationDirective,
    ReactiveFormsModule,
    SelectConceptComponent
  ],
  templateUrl: './edit-relation.component.html',
  styleUrl: './edit-relation.component.css',
})
export class EditRelation {
  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      predicate: FormControl<ConceptId>;
      object: FormControl<ConceptId>;
      id: FormControl<string>;
    }>
  >();

  static value2Form = (fb: NonNullableFormBuilder, r: Relation|undefined = undefined) => {
    return fb.group({
      predicate: [r?.predicate || {id: '', type: ''}],
      object: [r?.object || {id: '', type: ''}],
      id: [r?.id ?? ''],
    });
  }

  static form2Value = (
    r: ReturnType<ReturnType<typeof EditRelation.value2Form>['getRawValue']>
  ): Relation =>
    ({
      predicate: r.predicate,
      object: r.object,
      ...{id: r.id ? r.id : undefined}
    });
}

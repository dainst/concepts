import {Component, inject} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {
  NgbAccordionBody,
  NgbAccordionButton,
  NgbAccordionCollapse,
  NgbAccordionDirective, NgbAccordionHeader,
  NgbAccordionItem
} from '@ng-bootstrap/ng-bootstrap';
import {EditLabel} from '../edit-label/edit-label';

@Component({
  selector: 'app-concept-view-edit',
  imports: [
    ReactiveFormsModule,
    BootstrapFormValidationDirective,
    NgbAccordionItem,
    NgbAccordionDirective,
    NgbAccordionCollapse,
    NgbAccordionButton,
    NgbAccordionHeader,
    NgbAccordionBody,
    EditLabel
  ],
  templateUrl: './concept-view-edit.html',
  styleUrl: './concept-view-edit.css',
})
export class ConceptViewEdit extends ConceptViewComponent {
  private readonly fb = inject(NonNullableFormBuilder);

  readonly form = this.fb.group({
    title: this.fb.array([this.createLabel()])
  });

  private createLabel() {
    return this.fb.group(EditLabel.createLabelFormFieldDef());
  }

  addTitle() {
    this.form.controls.title.push(this.createLabel());
  }

  removeTitle(index: number) {
    this.form.controls.title.removeAt(index);
  }

  protected save() {
    if (this.form.invalid) {
      console.log('invalid')
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    console.log(value);
  }
}

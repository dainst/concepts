import {Component, effect, inject} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {AbstractControl, FormArray, NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {
  NgbAccordionBody,
  NgbAccordionButton,
  NgbAccordionCollapse,
  NgbAccordionDirective, NgbAccordionHeader,
  NgbAccordionItem
} from '@ng-bootstrap/ng-bootstrap';
import {EditLabel} from '../edit-label/edit-label';
import {Backend} from '../../services/backend';
import {Concept, Label} from 'concepts-common/interfaces/concept';
import {lastValueFrom} from 'rxjs';
import {Router} from '@angular/router';

@Component({
  selector: 'app-concept-view-edit',
  imports: [
    ReactiveFormsModule,
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
  private readonly bs = inject(Backend);
  private router = inject(Router);

  readonly form = this.fb.group({
    id: this.fb.group({
      type: ['concepts'],
      id: [''],
    }),
    domain: ['default', Validators.required],
    title: this.fb.array([this.createLabel()])
  });

  constructor() {
    super();
    effect(() => this.setForm(this.concept()));
  }

  private setForm(concept: Concept): void {
    const resetFormArray =  <T>(
      array: FormArray,
      items: T[],
      factory: (item: T) => AbstractControl
    ): void => {
      array.clear();

      for (const item of items) {
        array.push(factory(item));
      }
    }

    this.form.patchValue({
      id: concept.id,
      domain: concept.domain
    });

    resetFormArray(
      this.form.controls.title,
      (concept.labels || []).filter(l => l.type === 'title'),
      this.createLabel.bind(this)
    );

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }


  private createLabel(label: Label|undefined = undefined) {
    return this.fb.group(EditLabel.createLabelFormFieldDef(label));
  }

  addTitle() {
    this.form.controls.title.push(this.createLabel());
  }

  removeTitle(index: number) {
    this.form.controls.title.removeAt(index);
  }

  protected async save() {
    if (this.form.invalid) {
      console.log('invalid')
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    console.log(value);

    const unsavedConcept: Concept = {
      id: value.id,
      domain: value.domain,
      labels: [
        ...value.title.map((l): Label => ({
          type: 'title',
          transliteration: l.transliteration,
          label: l.label,
          language: l.language.id,
          ...{id: l.id ? l.id : undefined}
        }))
      ]
    };

    console.log(unsavedConcept);
    const newId = await lastValueFrom(this.bs.putConcept(unsavedConcept));
    console.log(newId);
    this.router.navigate(['/concept', newId.type, newId.id]);
  }
}

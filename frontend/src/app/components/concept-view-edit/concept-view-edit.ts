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
import {MessageService} from '../../services/message.service';
import {EditGeographicalExtend} from '../edit-geographic-extend/edit-geographical-extend.component';

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
    EditLabel,
    EditGeographicalExtend
  ],
  templateUrl: './concept-view-edit.html',
  styleUrl: './concept-view-edit.css',
})
export class ConceptViewEdit extends ConceptViewComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly bs = inject(Backend);
  private readonly router = inject(Router);
  private readonly ms = inject(MessageService);

  readonly form = this.fb.group({
    id: this.fb.group({
      type: ['concepts'],
      id: [''],
    }),
    domain: ['default', Validators.required],
    title: this.fb.array<ReturnType<typeof EditLabel.value2Form>>([]),
    geographicalExtend: this.fb.array<ReturnType<typeof EditGeographicalExtend.value2Form>>([])
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
      label => EditLabel.value2Form(this.fb, label)
    );

    resetFormArray(
      this.form.controls.geographicalExtend,
      concept.geographicalExtends || [],
      ge => EditGeographicalExtend.value2Form(this.fb, ge)
    );

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  private createLabel(label: Label|undefined = undefined) {
    return ;
  }

  add(type: 'title' | 'geographicalExtend'): void {
    switch (type) {
      case 'title':
        return this.form.controls.title.push(EditLabel.value2Form(this.fb));
      case 'geographicalExtend':
        return this.form.controls.geographicalExtend.push(EditGeographicalExtend.value2Form(this.fb))
    }
  }

  remove(type: 'title' | 'geographicalExtend', index: number) {
    this.form.controls[type].removeAt(index);
  }

  protected async save(): Promise<boolean> {
    if (this.form.invalid) {
      console.log('invalid')
      this.form.markAllAsTouched();
      return false;
    }

    const value = this.form.getRawValue();

    console.log(value);

    const unsavedConcept: Concept = {
      id: value.id,
      domain: value.domain,
      labels: [
        ...value.title.map(EditLabel.form2Value)
      ],
      geographicalExtends: [
        ...value.geographicalExtend.map(EditGeographicalExtend.form2Value)
      ]
    };

    console.log(unsavedConcept);

    const saveResponse = await lastValueFrom(this.bs.upcertConcept(unsavedConcept));

    console.log(saveResponse);

    if (saveResponse.new) {
      this.ms.add({
        type: 'successful-created',
        params: [saveResponse.id.type, saveResponse.id.id]
      });
      return this.router.navigate(['/concept', saveResponse.id.type, saveResponse.id.id]);
    }

    this.ms.add({
      type: 'successful-updated',
      params: [saveResponse.id.type, saveResponse.id.id]
    });
    return true;
  }
}

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
import {BackendService} from '../../services/backend.service';
import {Concept} from 'concepts-common/interfaces/concept';
import {lastValueFrom} from 'rxjs';
import {Router} from '@angular/router';
import {MessageService} from '../../services/message.service';
import {EditGeographicalExtend} from '../edit-geographic-extend/edit-geographical-extend.component';
import {EditTemporalExtend} from '../edit-temporal-extend/edit-temporal-extend';
import {EditRelation} from '../edit-relation/edit-relation.component';
import {packRelationSets, unpackRelationSet} from 'concepts-common/functions/relation-set';

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
    EditGeographicalExtend,
    EditTemporalExtend,
    EditRelation
  ],
  templateUrl: './concept-view-edit.html',
  styleUrl: './concept-view-edit.css'
})
export class ConceptViewEdit extends ConceptViewComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly bs = inject(BackendService);
  private readonly router = inject(Router);
  private readonly ms = inject(MessageService);

  readonly form = this.fb.group({
    id: this.fb.group({
      type: ['concepts'],
      id: ['']
    }),
    domain: ['default', Validators.required],
    title: this.fb.array<ReturnType<typeof EditLabel.value2Form>>([]),
    geographicalExtend: this.fb.array<ReturnType<typeof EditGeographicalExtend.value2Form>>([]),
    temporalExtend: this.fb.array<ReturnType<typeof EditTemporalExtend.value2Form>>([]),
    relation: this.fb.array<ReturnType<typeof EditRelation.value2Form>>([])
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
    };

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

    resetFormArray(
      this.form.controls.temporalExtend,
      concept.temporalExtends || [],
      te => EditTemporalExtend.value2Form(this.fb, te)
    );

    resetFormArray(
      this.form.controls.relation,
      (concept.relations || []).flatMap(unpackRelationSet),
      r => EditRelation.value2Form(this.fb, r)
    );

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  add(type: 'title' | 'geographicalExtend' | 'temporalExtend' | 'relation'): void {
    switch (type) {
      case 'title':
        return this.form.controls.title.push(EditLabel.value2Form(this.fb));
      case 'geographicalExtend':
        return this.form.controls.geographicalExtend.push(EditGeographicalExtend.value2Form(this.fb));
      case 'temporalExtend':
        return this.form.controls.temporalExtend.push(EditTemporalExtend.value2Form(this.fb));
      case 'relation':
        return this.form.controls.relation.push(EditRelation.value2Form(this.fb));
    }
  }

  remove(type: 'title' | 'geographicalExtend' | 'temporalExtend' | 'relation', index: number): void {
    this.form.controls[type].removeAt(index);
  }

  protected async save(): Promise<boolean> {
    if (this.form.invalid) {
      console.log('invalid');
      this.form.markAllAsTouched();
      return false;
    }

    const value = this.form.getRawValue();

    console.log(value);

    const unsavedConcept: Concept = {
      id: value.id,
      domain: value.domain,
      labels: value.title.map(EditLabel.form2Value),
      geographicalExtends: value.geographicalExtend.map(EditGeographicalExtend.form2Value),
      temporalExtends: value.temporalExtend.map(EditTemporalExtend.form2Value),
      relations: packRelationSets(value.relation.map(EditRelation.form2Value))
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

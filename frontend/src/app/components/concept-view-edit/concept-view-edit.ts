import {Component, effect, inject} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
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
import {LanguagesService} from '../../services/languages';
import {toSignal} from '@angular/core/rxjs-interop';

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
  private readonly ls = inject(LanguagesService);
  private readonly languages = toSignal(this.ls.languages$, {initialValue: []});

  readonly form = this.fb.group({
    id: this.fb.group({
      type: ['concepts', Validators.required],
      id: [''],
    }),
    domain: ['default', Validators.required],
    title: this.fb.array([this.createLabel()])
  });

  constructor() {
    super();
    effect(() => {
      const concept = this.concept();
      if (!this.languages().length) return;
      this.form.reset({
        id: concept.id,
        domain: concept.domain,
        title: {
          ...(concept.labels || [])
            .filter(l => l.type === 'title')
            .map(t => ({
              language: {
                id: t.language,
                name: this.languages().find(l => l.id.id === t.language)?.title ?? 'xxx'
              },
              transliteration: t.transliteration,
              label: t.label
            }))
        }
      });
    });
  }


  private createLabel() {
    return this.fb.group(EditLabel.createLabelFormFieldDef());
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
          ...l,
          type: 'title',
          language: l.language.id
        }))
      ]
    };

    console.log(unsavedConcept);
    const newId = await lastValueFrom(this.bs.putConcept(unsavedConcept));
    console.log(newId);
    // yay
  }
}

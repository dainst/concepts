import {Component, computed, effect, inject, input, OnInit, output, Signal, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup, NonNullableFormBuilder,
  ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import {NgbHighlight, NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map, Observable, OperatorFunction, withLatestFrom} from 'rxjs';
import {LanguagesService} from '../../services/languages';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {Language} from '../../interfaces/forms';
import {Label} from 'concepts-common/interfaces/concept';

@Component({
  selector: 'app-edit-label',
  imports: [
    BootstrapFormValidationDirective,
    ReactiveFormsModule,
    NgbTypeahead,
    NgbHighlight
  ],
  templateUrl: './edit-label.html',
  styleUrl: './edit-label.css',
})
export class EditLabel implements OnInit {
  readonly ls = inject(LanguagesService);
  private readonly languages: Signal<Language[]> = toSignal(
    this.ls.languages$
      .pipe(map(concepts => concepts.map(c => ({name: c.title || c.id.id, id: c.id.id}))))
    ,
    {
      initialValue: [
        {id: 'deu', name: 'German'},
        {id: 'end', name: 'English'}
      ]
    }
  );
  private readonly l$ = toObservable(this.languages);

  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      language: FormControl<Language>;
      label: FormControl<string>;
      transliteration: FormControl<string>;
      id: FormControl<string>;
    }>
  >();
  readonly caption = input<string>();

  readonly showTransliterationField = signal(false);

  constructor() {
    effect(() => {
      if (!this.languages().length) return;
      const v = this.form().controls.language.value;
      if (v.name !== v.id) return;
      const fullLanguage = this.languages()
          .find(l => l.id === v.id)
        ?? {id: '', name: ''};
      this.form().controls.language.setValue(fullLanguage);
    });
  }

  ngOnInit() {
    const labelControl = this.form().controls.label;
    this.showTransliterationField.set(EditLabel.hasNonLatin(labelControl.value));
    labelControl.valueChanges.subscribe(newLabel => {
      this.showTransliterationField.set(EditLabel.hasNonLatin(newLabel));
    });
  }


  private static hasNonLatin = (str: string): boolean =>
    [...str].some(c => /\p{L}/u.test(c) && !/\p{Script=Latin}/u.test(c));

  protected searchLanguage: OperatorFunction<string, readonly Language[]> =
    (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        filter(term => term.length >= 2),
        withLatestFrom(this.l$),
        map(([term, languages]) =>
          languages
            .filter(lang => new RegExp(term.replaceAll(/[\W]+/g, ''), 'mi').test(lang.name + lang.id))
        ),
      );

  protected formatter = (x: { name: string, id: string }) => x.name;

  private static onlyLatinValidator
    = (control: AbstractControl): ValidationErrors | null =>
      EditLabel.hasNonLatin(control.value) ? {hasNonLatin: true} : null;

  private static validLangCode
    = (control: AbstractControl<Language>): ValidationErrors | null =>
    control.value && control.value.id && (control.value.id.length === 3) ? null : {invalidLangCode: true};

  static form2Value = (l: ReturnType<ReturnType<typeof EditLabel.value2Form>['getRawValue']>): Label => ({
    type: 'title',
    transliteration: l.transliteration,
    label: l.label,
    language: l.language.id,
    ...{id: l.id ? l.id : undefined}
  });

  static value2Form = (fb: NonNullableFormBuilder, label: Label | undefined = undefined) => fb.group({
    language: [
      label ? <Language>{id: label.language, name: label.language} : <Language>{id: '', name: ''},
      EditLabel.validLangCode
    ],
    label: [
      label?.label ?? '',
      Validators.required
    ],
    transliteration: [
      label?.transliteration ?? '',
      EditLabel.onlyLatinValidator
    ],
    id: [
      label?.id ?? ''
    ],
  });
}

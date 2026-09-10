import {Component, computed, inject, input, OnInit, output, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule, ValidationErrors, Validators
} from '@angular/forms';
import {NgbHighlight, NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {debounceTime, distinctUntilChanged, filter, map, Observable, OperatorFunction, withLatestFrom} from 'rxjs';
import {Backend} from '../../services/backend';
import {LanguagesService} from '../../services/languages';
import {JsonPipe} from '@angular/common';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {toSignal} from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-edit-label',
  imports: [
    BootstrapFormValidationDirective,
    ReactiveFormsModule,
    NgbTypeahead,
    NgbHighlight,
    JsonPipe
  ],
  templateUrl: './edit-label.html',
  styleUrl: './edit-label.css',
})
export class EditLabel implements OnInit {
  readonly ls = inject(LanguagesService);

  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      language: FormControl<string>;
      label: FormControl<string>;
      transliteration: FormControl<string>;
    }>
  >();
  readonly caption = input<string>();

  ngOnInit() {
    const labelControl = this.form().controls.label;
    this.showTransliterationField.set(EditLabel.hasNonLatin(labelControl.value));
    labelControl.valueChanges.subscribe(newLabel => {
      this.showTransliterationField.set(EditLabel.hasNonLatin(newLabel));
    });
  }
  readonly showTransliterationField = signal(false);

  private static hasNonLatin = (str: string): boolean =>
    [...str].some(c => /\p{L}/u.test(c) && !/\p{Script=Latin}/u.test(c));

  protected searchLanguage: OperatorFunction<string, readonly { id: string; name: string }[]> =
    (text$: Observable<string>) =>
      text$.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        filter(term => term.length >= 2),
        withLatestFrom(this.ls.languages$),
        map(([term, languages]) =>
          languages
            .map(c => ({name: c.title || c.id.id, id: c.id.id}))
            .filter(lang => new RegExp(term.replaceAll(/[\W]+/g, ''), 'mi').test(lang.name + lang.id))
        ),
      );

  protected formatter = (x: { name: string, id: string }) => x.name;

  private static onlyLatinValidator
    = (control: AbstractControl): ValidationErrors | null =>
      EditLabel.hasNonLatin(control.value) ? {hasNonLatin: true} : null;

  static createLabelFormFieldDef = () => ({
    language: ['', Validators.required],
    label: ['', Validators.required],
    transliteration: ['', EditLabel.onlyLatinValidator]
  });
}

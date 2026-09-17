import {Component, effect, input, output, signal} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule, ValidationErrors,
  Validators
} from '@angular/forms';
import {GeographicalExtend} from 'concepts-common/interfaces/concept';
import {BootstrapFormValidationDirective} from '../../directives/bootstrap-form-validation';
import {JsonPipe, KeyValuePipe} from '@angular/common';
import {NgbAlert, NgbCollapse, NgbTooltip} from '@ng-bootstrap/ng-bootstrap';
import {check, HintError} from '@placemarkio/check-geojson';


@Component({
  selector: 'app-edit-geographic-extend',
  imports: [
    BootstrapFormValidationDirective,
    FormsModule,
    ReactiveFormsModule,
    JsonPipe,
    KeyValuePipe,
    NgbAlert,
    NgbCollapse,
    NgbTooltip
  ],
  templateUrl: './edit-geographical-extend.component.html',
  styleUrl: './edit-geographical-extend.component.css',
})
export class EditGeographicalExtend {
  readonly remove = output<void>();
  readonly form = input.required<
    FormGroup<{
      centerLat: FormControl<number>;
      centerLng: FormControl<number>;
      shape: FormControl<string>;
      certainty: FormControl<number>;
      precision: FormControl<number>;
      id: FormControl<string>
    }>
  >();
  readonly shapeCollapsed = signal(true);

  constructor() {
    effect(() => this.shapeCollapsed.set(!this.form().controls.shape.value));
  }

  static isValidGeoJSON = (type: string) => (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    try {
      const geoJSON = check(control.value);
      if (geoJSON.type !== type) return {invalidGeoJSON: `Only type "${type}" is supported`};
    } catch (e) {
      if (e instanceof HintError) {
        return {invalidGeoJSON: e.issues.map(i => i.message)};
      }
      return {invalidGeoJSON: "Unknown Error"};
    }
    return null;
  }

  static value2Form = (fb: NonNullableFormBuilder, ge: GeographicalExtend|undefined = undefined) => {
    const getCenterCoordinates = (ge: GeographicalExtend|undefined): [number, number] => {
      if (!ge) return [0, 0];
      let geoJSON: ReturnType<typeof check>;
      try {
        geoJSON = check(ge.center);
      } catch (e) {
        throw new Error("Invalid GeoJSON for center");
      }
      if (geoJSON.type !== 'Point') throw new Error("Invalid center, type must be Point");
      return [geoJSON.coordinates[1], geoJSON.coordinates[0]];
    };
    const center = getCenterCoordinates(ge);
    return fb.group({
      centerLat: [center[0], [Validators.min(-90), Validators.max(90)]],
      centerLng: [center[1], [Validators.min(-180), Validators.max(180)]],
      shape: [ge?.shape || '', EditGeographicalExtend.isValidGeoJSON('MultiPolygon')],
      certainty: [ge?.certainty || 100, [Validators.min(-0), Validators.max(100)]],
      precision: [ge?.precision || 100, [Validators.min(-0), Validators.max(100)]],
      id: [ge?.id ?? ''],
    });
  }

  static form2Value = (
    ge: ReturnType<ReturnType<typeof EditGeographicalExtend.value2Form>['getRawValue']>
  ): GeographicalExtend =>
      ({
        center: JSON.stringify({type: 'Point', coordinates: [Number(ge.centerLng), Number(ge.centerLat)]}),
        certainty: ge.certainty,
        precision: ge.precision,
        shape: ge.shape,
        ...{id: ge.id ? ge.id : undefined}
      });

  protected formatJSON() {
    const rawValue = this.form().controls.shape.getRawValue();
    if (!rawValue) return;
    const valueObj = JSON.parse(rawValue);
    const valueStr = JSON.stringify(valueObj, null, 2);
    this.form().controls.shape.setValue(valueStr);
  }
}

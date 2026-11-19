import {Component, input, model} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {AsyncPipe, JsonPipe, NgTemplateOutlet} from '@angular/common';
import {CheckboxGroupOption} from '../../interfaces/checkbox-group';
import {isConceptId} from 'concepts-common/functions/concept.typeguards';
import {TitlePipe} from '../../pipes/title-pipe';


@Component({
  selector: 'app-checkbox-group',
  standalone: true,
  imports: [NgTemplateOutlet, JsonPipe, TitlePipe, AsyncPipe],
  templateUrl: './checkbox-group.html'
})
export class CheckboxGroupComponent implements FormValueControl<string[]> {
  readonly options =  input.required<readonly CheckboxGroupOption[]>();
  readonly value = model<string[]>([]);
  readonly disabled = input(false);

  isChecked(option: CheckboxGroupOption): boolean {
    return this.getState(option);
  }

  private getState(option: CheckboxGroupOption): boolean {
    const selected = new Set(this.value());
    const path = this.findPath(this.options(), option.value);

    if (path?.some(node => selected.has(node.value))) return true;

    return this.getDescendantState(option, selected);
  }

  private getDescendantState(option: CheckboxGroupOption, selected: Set<string>): boolean {
    const children = option.children ?? [];

    if (children.length === 0) return false;

    const states = children.map(child =>
      this.getDescendantState(child, selected)
    );

    return states.every(Boolean);
  }

  toggle(option: CheckboxGroupOption, checked: boolean): void {
    if (this.disabled()) return;

    const selected = new Set(this.value());
    const path = this.findPath(this.options(), option.value);

    if (!path) return;

    if (checked) {
      for (const value of this.collectValues(option)) {
        selected.delete(value);
      }
      selected.add(option.value);

    } else {
      let ancestorIndex = -1;

      for (let i = 0; i < path.length - 1; i++) {
        if (selected.has(path[i].value)) {
          ancestorIndex = i;
        }
      }

      if (ancestorIndex >= 0) {
        // Vorfahren-Auswahl auflösen.
        const ancestor = path[ancestorIndex];

        for (const value of this.collectValues(ancestor)) {
          selected.delete(value);
        }

        for (let i = ancestorIndex; i < path.length - 1; i++) {
          const parent = path[i];
          const pathChild = path[i + 1];

          for (const sibling of parent.children ?? []) {
            if (sibling.value !== pathChild.value) {
              selected.add(sibling.value);
            }
          }
        }

      } else {
        for (const value of this.collectValues(option)) {
          selected.delete(value);
        }
      }
    }

    this.value.set(this.normalizeSelection(selected));
  }

  private collectValues(option: CheckboxGroupOption): string[] {
    return [
      option.value,
      ...(option.children ?? []).flatMap(child =>
        this.collectValues(child)
      )
    ];
  }

  private findPath(
    options: readonly CheckboxGroupOption[],
    value: string,
    path: CheckboxGroupOption[] = []
  ): CheckboxGroupOption[] | null {

    for (const option of options) {
      const currentPath = [...path, option];

      if (option.value === value) {
        return currentPath;
      }

      const found = this.findPath(
        option.children ?? [],
        value,
        currentPath
      );

      if (found) {
        return found;
      }
    }

    return null;
  }


  private normalizeSelection(selected: Set<string>): string[] {
    const result: string[] = [];

    const visit = (option: CheckboxGroupOption): boolean => {
      if (selected.has(option.value)) {
        result.push(option.value);
        return true;
      }

      const children = option.children ?? [];

      if (children.length === 0) {
        return false;
      }

      const start = result.length;
      const childStates = children.map(child => visit(child));

      if (childStates.every(Boolean)) {
        result.splice(start);
        result.push(option.value);
        return true;
      }

      return false;
    };

    this.options().forEach(option => visit(option));

    return result;
  }

  protected readonly isConceptId = isConceptId;
}

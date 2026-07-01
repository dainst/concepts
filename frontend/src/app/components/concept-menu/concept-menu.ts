import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal
} from '@angular/core';
import {ConceptMenuEntry} from '../../interfaces/ui';

@Component({
  selector: 'app-concept-views',
  imports: [],
  templateUrl: './concept-menu.html',
  styleUrl: './concept-menu.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConceptMenu {
  readonly items = input.required<ConceptMenuEntry[]>();
  readonly selectedId = input<string>();
  readonly selectedChange = output<string>();
  private readonly internalSelection = signal<string | null>(null);

  readonly activeId = computed(() =>
    this.selectedId() ?? this.internalSelection()
  );

  select(item: ConceptMenuEntry) {
    if (item.disabled) {
      return;
    }

    this.internalSelection.set(item.id);
    this.selectedChange.emit(item.id);
  }

  isSelected(id: string) {
    return this.activeId() === id;
  }

}

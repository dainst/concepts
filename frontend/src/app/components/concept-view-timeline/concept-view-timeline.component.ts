import {AfterViewInit, Component, computed, signal} from '@angular/core';
import {ConceptViewComponent} from '../concept-view';
import {Timeline} from '../timeline/timeline';
import {TemporalConcept} from 'concepts-common/src/interfaces/concept';
import {isTemporalConcept} from 'concepts-common/src/functions/concept.typeguards';

@Component({
  selector: 'app-concept-view-timeline',
  imports: [
    Timeline
  ],
  templateUrl: './concept-view-timeline.component.html',
  styleUrl: './concept-view-timeline.component.css',
})
export class ConceptViewTimeline extends ConceptViewComponent implements AfterViewInit {
  private viewInitialized = signal(false);

  protected readonly data = computed<TemporalConcept[]>(() => {
    const concept = this.concept();
    if (!this.viewInitialized()) {
      console.warn('not initialized');
      return [];
    }
    if (!isTemporalConcept(concept)) {
      throw new Error('timeline not available for concept without temporal dimension');
    }
    return [concept];
  });

  // TODO this is ugly. use the real id
  protected selected = computed<string>(() => this.concept().id.type + '-' + this.concept().id.id);

  ngAfterViewInit() {
    this.viewInitialized.set(true);
  }
}

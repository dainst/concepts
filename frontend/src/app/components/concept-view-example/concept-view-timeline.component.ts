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
    if (!this.viewInitialized()) {
      console.warn('not initialized');
      return [];
    }
    if (!isTemporalConcept(this.concept())) {
      console.warn('no tmp extend', this.concept());
      // TODO show some warning
      return [];
    }
    console.log("sd")
    return [this.concept()];
  });

  // TODO this is ugly. use the real id
  protected selected = computed<string>(() => this.concept().id.type + '-' + this.concept().id.id);

  ngAfterViewInit() {
    this.viewInitialized.set(true);
  }
}

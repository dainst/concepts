import {Component, OnInit, signal, Signal} from '@angular/core';
import {Timeline} from '../../timeline/timeline';
import {TemporalConcept} from 'concepts-common/src/interfaces/concept';
import {dummyConceptGenerator} from '../../timeline/dummy-data';

@Component({
  selector: 'app-about',
  imports: [
    Timeline
  ],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About implements OnInit {
  ngOnInit(): void {
      setTimeout(() => {
        console.log('pump it')
        this.pumpData();
      },100)
  }
  protected data = signal<TemporalConcept[]>([]);
  protected selected = signal<string | undefined>(undefined);

  private gen = dummyConceptGenerator();

  protected pumpData() {
    this.data.set([
      ...this.data(),
      ...Array.from({length: 3}).map(_ => this.gen.next().value)
    ]);
  }

  protected select() {
    if (!this.data().length) {
      this.selected.set(undefined);
      return;
    }
    const last = this.data()[this.data().length - 1];
    this.selected.set(last.id.type + '/' + last.id.id);
  };
}

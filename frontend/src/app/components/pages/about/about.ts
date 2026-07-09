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
    setTimeout(() => {
      console.log('pump it even more')
      this.pumpData();
    },1000)
  }
  protected data = signal<TemporalConcept[]>([]);
  protected selected = signal<string | undefined>(undefined);
  protected axisTicks = signal<number>(10);
  protected inactive = signal<boolean>(false);

  private gen = dummyConceptGenerator();

  protected pumpData() {
    this.data.set([
      ...this.data(),
      ...Array.from({length: 3}).map(_ => this.gen.next().value)
    ]);
  }

  protected select(what: number = 1) {
    if (!this.data().length) {
      this.selected.set(undefined);
      return;
    }
    const last = this.data()[this.data().length - what];
    this.selected.set(`${last.id.id}-${last.id.type}`);
  };


  protected increaseAxisTicks() {
    this.axisTicks.set(this.axisTicks() + 1);
  }

  protected toggleInactive() {
    this.inactive.set(!this.inactive());
  }
}

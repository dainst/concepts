import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptViewTimeline } from './concept-view-timeline.component';

describe('ConceptViewExample', () => {
  let component: ConceptViewTimeline;
  let fixture: ComponentFixture<ConceptViewTimeline>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewTimeline],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptViewTimeline);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

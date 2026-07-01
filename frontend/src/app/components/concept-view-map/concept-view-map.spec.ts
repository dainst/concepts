import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptViewMap } from './concept-view-map';

describe('ConceptViewMap', () => {
  let component: ConceptViewMap;
  let fixture: ComponentFixture<ConceptViewMap>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewMap],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptViewMap);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

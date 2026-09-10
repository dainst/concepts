import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptViewEdit } from './concept-view-edit';

describe('ConceptViewEdit', () => {
  let component: ConceptViewEdit;
  let fixture: ComponentFixture<ConceptViewEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewEdit],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptViewEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

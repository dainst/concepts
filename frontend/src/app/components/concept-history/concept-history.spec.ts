import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ConceptViewHistory} from './concept-history';

describe('ConceptHistory', () => {
  let component: ConceptViewHistory;
  let fixture: ComponentFixture<ConceptViewHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptViewHistory]
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptViewHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConceptMenu } from './concept-menu';

describe('ConceptMenu', () => {
  let component: ConceptMenu;
  let fixture: ComponentFixture<ConceptMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConceptMenu],
    }).compileComponents();

    fixture = TestBed.createComponent(ConceptMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

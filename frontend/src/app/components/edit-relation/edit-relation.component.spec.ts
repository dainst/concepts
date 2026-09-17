import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRelation } from './edit-relation.component';

describe('EditRelations', () => {
  let component: EditRelation;
  let fixture: ComponentFixture<EditRelation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditRelation],
    }).compileComponents();

    fixture = TestBed.createComponent(EditRelation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTemporalExtend } from './edit-temporal-extend';

describe('EditTemporalExtend', () => {
  let component: EditTemporalExtend;
  let fixture: ComponentFixture<EditTemporalExtend>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditTemporalExtend],
    }).compileComponents();

    fixture = TestBed.createComponent(EditTemporalExtend);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

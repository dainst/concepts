import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSource } from './edit-source';

describe('EditSource', () => {
  let component: EditSource;
  let fixture: ComponentFixture<EditSource>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSource]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSource);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

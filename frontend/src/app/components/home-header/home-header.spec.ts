import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeHeader } from './home-header';

describe('HomeHeader', () => {
  let component: HomeHeader;
  let fixture: ComponentFixture<HomeHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeHeader],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Spreturn } from './spreturn';

describe('Spreturn', () => {
  let component: Spreturn;
  let fixture: ComponentFixture<Spreturn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spreturn]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Spreturn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Regcomp } from './regcomp';

describe('Regcomp', () => {
  let component: Regcomp;
  let fixture: ComponentFixture<Regcomp>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Regcomp]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Regcomp);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

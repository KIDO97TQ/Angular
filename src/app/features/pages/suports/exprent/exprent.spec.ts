import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Exprent } from './exprent';

describe('Exprent', () => {
  let component: Exprent;
  let fixture: ComponentFixture<Exprent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Exprent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Exprent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

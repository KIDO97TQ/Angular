import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Myorder } from './myorder';

describe('Myorder', () => {
  let component: Myorder;
  let fixture: ComponentFixture<Myorder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Myorder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Myorder);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

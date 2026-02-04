import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Guidcontent } from './guidcontent';

describe('Guidcontent', () => {
  let component: Guidcontent;
  let fixture: ComponentFixture<Guidcontent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guidcontent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Guidcontent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

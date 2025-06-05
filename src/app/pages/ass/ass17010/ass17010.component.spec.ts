import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17010Component } from './ass17010.component';

describe('ASS17010Component', () => {
  let component: ASS17010Component;
  let fixture: ComponentFixture<ASS17010Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17010Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17010Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS17070Component } from './ass17070.component';

describe('ASS17070Component', () => {
  let component: ASS17070Component;
  let fixture: ComponentFixture<ASS17070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS17070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS17070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

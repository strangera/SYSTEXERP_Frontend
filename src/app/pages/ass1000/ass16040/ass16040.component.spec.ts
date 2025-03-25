import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16040Component } from './ass16040.component';

describe('ASS16040Component', () => {
  let component: ASS16040Component;
  let fixture: ComponentFixture<ASS16040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

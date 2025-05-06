import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ASS16080Component } from './ass16080.component';

describe('ASS16080Component', () => {
  let component: ASS16080Component;
  let fixture: ComponentFixture<ASS16080Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ASS16080Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ASS16080Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

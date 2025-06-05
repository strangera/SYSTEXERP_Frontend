import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN32020Component } from './fin32020.component';

describe('FIN32020Component', () => {
  let component: FIN32020Component;
  let fixture: ComponentFixture<FIN32020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN32020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN32020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

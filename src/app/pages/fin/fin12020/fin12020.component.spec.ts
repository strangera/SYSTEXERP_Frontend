import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN12020Component } from './fin12020.component';

describe('FIN12020Component', () => {
  let component: FIN12020Component;
  let fixture: ComponentFixture<FIN12020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN12020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN12020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

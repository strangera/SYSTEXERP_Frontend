import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN61020Component } from './fin61020.component';

describe('FIN61020Component', () => {
  let component: FIN61020Component;
  let fixture: ComponentFixture<FIN61020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN61020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN61020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

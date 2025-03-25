import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41020Component } from './fin41020.component';

describe('FIN41020Component', () => {
  let component: FIN41020Component;
  let fixture: ComponentFixture<FIN41020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

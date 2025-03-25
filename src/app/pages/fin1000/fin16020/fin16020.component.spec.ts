import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN16020Component } from './fin16020.component';

describe('FIN16020Component', () => {
  let component: FIN16020Component;
  let fixture: ComponentFixture<FIN16020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN16020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN16020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

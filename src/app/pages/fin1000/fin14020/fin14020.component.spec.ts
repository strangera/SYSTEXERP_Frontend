import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14020Component } from './fin14020.component';

describe('FIN14020Component', () => {
  let component: FIN14020Component;
  let fixture: ComponentFixture<FIN14020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11070Component } from './fin11070.component';

describe('FIN11070Component', () => {
  let component: FIN11070Component;
  let fixture: ComponentFixture<FIN11070Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11070Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11070Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

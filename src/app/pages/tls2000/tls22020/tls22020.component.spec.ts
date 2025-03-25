import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS22020Component } from './tls22020.component';

describe('TLS22020Component', () => {
  let component: TLS22020Component;
  let fixture: ComponentFixture<TLS22020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS22020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS22020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

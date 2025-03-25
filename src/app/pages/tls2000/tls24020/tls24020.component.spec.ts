import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24020Component } from './tls24020.component';

describe('TLS24020Component', () => {
  let component: TLS24020Component;
  let fixture: ComponentFixture<TLS24020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

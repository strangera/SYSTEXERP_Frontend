import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25030Component } from './tls25030.component';

describe('TLS25030Component', () => {
  let component: TLS25030Component;
  let fixture: ComponentFixture<TLS25030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

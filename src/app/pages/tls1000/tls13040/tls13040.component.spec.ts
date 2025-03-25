import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13040Component } from './tls13040.component';

describe('TLS13040Component', () => {
  let component: TLS13040Component;
  let fixture: ComponentFixture<TLS13040Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13040Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13040Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

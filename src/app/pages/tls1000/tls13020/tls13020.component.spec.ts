import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13020Component } from './tls13020.component';

describe('TLS13020Component', () => {
  let component: TLS13020Component;
  let fixture: ComponentFixture<TLS13020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13030Component } from './tls13030.component';

describe('TLS13030Component', () => {
  let component: TLS13030Component;
  let fixture: ComponentFixture<TLS13030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J030Component } from './tls2j030.component';

describe('TLS2J030Component', () => {
  let component: TLS2J030Component;
  let fixture: ComponentFixture<TLS2J030Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J030Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J030Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

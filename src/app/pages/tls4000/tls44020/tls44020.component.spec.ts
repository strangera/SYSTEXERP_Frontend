import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS44020Component } from './tls44020.component';

describe('TLS44020Component', () => {
  let component: TLS44020Component;
  let fixture: ComponentFixture<TLS44020Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS44020Component]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS44020Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

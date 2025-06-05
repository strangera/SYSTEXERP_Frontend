import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS14020CRUComponent } from './tls14020-cru.component';

describe('TLS14020CRUComponent', () => {
  let component: TLS14020CRUComponent;
  let fixture: ComponentFixture<TLS14020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS14020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS14020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

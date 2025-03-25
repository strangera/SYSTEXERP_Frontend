import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52020CRUComponent } from './tls52020-cru.component';

describe('TLS52020CRUComponent', () => {
  let component: TLS52020CRUComponent;
  let fixture: ComponentFixture<TLS52020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

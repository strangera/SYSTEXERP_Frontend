import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43020CRUComponent } from './tls43020-cru.component';

describe('TLS43020CRUComponent', () => {
  let component: TLS43020CRUComponent;
  let fixture: ComponentFixture<TLS43020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

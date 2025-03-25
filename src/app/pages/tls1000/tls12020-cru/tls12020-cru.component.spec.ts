import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12020CRUComponent } from './tls12020-cru.component';

describe('TLS12020CRUComponent', () => {
  let component: TLS12020CRUComponent;
  let fixture: ComponentFixture<TLS12020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

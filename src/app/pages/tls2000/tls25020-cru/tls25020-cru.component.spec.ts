import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25020CRUComponent } from './tls25020-cru.component';

describe('TLS25020CRUComponent', () => {
  let component: TLS25020CRUComponent;
  let fixture: ComponentFixture<TLS25020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53020CRUComponent } from './tls53020-cru.component';

describe('TLS53020CRUComponent', () => {
  let component: TLS53020CRUComponent;
  let fixture: ComponentFixture<TLS53020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

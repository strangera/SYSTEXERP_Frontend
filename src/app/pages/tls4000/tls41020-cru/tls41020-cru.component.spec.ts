import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS41020CRUComponent } from './tls41020-cru.component';

describe('TLS41020CRUComponent', () => {
  let component: TLS41020CRUComponent;
  let fixture: ComponentFixture<TLS41020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS41020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS41020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2F020CRUComponent } from './tls2f020-cru.component';

describe('TLS2F020CRUComponent', () => {
  let component: TLS2F020CRUComponent;
  let fixture: ComponentFixture<TLS2F020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2F020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2F020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

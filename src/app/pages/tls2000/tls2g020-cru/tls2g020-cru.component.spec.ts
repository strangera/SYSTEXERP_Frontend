import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G020CRUComponent } from './tls2g020-cru.component';

describe('TLS2G020CRUComponent', () => {
  let component: TLS2G020CRUComponent;
  let fixture: ComponentFixture<TLS2G020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

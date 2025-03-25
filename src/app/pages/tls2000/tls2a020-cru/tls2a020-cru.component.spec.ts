import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2A020CRUComponent } from './tls2a020-cru.component';

describe('TLS2A020CRUComponent', () => {
  let component: TLS2A020CRUComponent;
  let fixture: ComponentFixture<TLS2A020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2A020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2A020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

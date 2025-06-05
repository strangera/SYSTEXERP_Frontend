import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46020CRUComponent } from './tls46020-cru.component';

describe('TLS46020CRUComponent', () => {
  let component: TLS46020CRUComponent;
  let fixture: ComponentFixture<TLS46020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28020CRUComponent } from './tls28020-cru.component';

describe('TLS28020CRUComponent', () => {
  let component: TLS28020CRUComponent;
  let fixture: ComponentFixture<TLS28020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51020CRUComponent } from './tls51020-cru.component';

describe('TLS51020CRUComponent', () => {
  let component: TLS51020CRUComponent;
  let fixture: ComponentFixture<TLS51020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

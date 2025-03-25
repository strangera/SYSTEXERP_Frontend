import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS45020CRUComponent } from './tls45020-cru.component';

describe('TLS45020CRUComponent', () => {
  let component: TLS45020CRUComponent;
  let fixture: ComponentFixture<TLS45020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS45020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS45020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24020CRUComponent } from './tls24020-cru.component';

describe('TLS24020CRUComponent', () => {
  let component: TLS24020CRUComponent;
  let fixture: ComponentFixture<TLS24020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

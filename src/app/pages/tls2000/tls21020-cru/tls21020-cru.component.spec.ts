import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21020CRUComponent } from './tls21020-cru.component';

describe('TLS21020CRUComponent', () => {
  let component: TLS21020CRUComponent;
  let fixture: ComponentFixture<TLS21020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

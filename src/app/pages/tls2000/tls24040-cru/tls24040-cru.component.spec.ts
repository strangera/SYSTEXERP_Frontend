import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS24040CRUComponent } from './tls24040-cru.component';

describe('TLS24040CRUComponent', () => {
  let component: TLS24040CRUComponent;
  let fixture: ComponentFixture<TLS24040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS24040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS24040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

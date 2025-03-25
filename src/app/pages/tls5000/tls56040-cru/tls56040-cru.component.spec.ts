import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS56040CRUComponent } from './tls56040-cru.component';

describe('TLS56040CRUComponent', () => {
  let component: TLS56040CRUComponent;
  let fixture: ComponentFixture<TLS56040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS56040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS56040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

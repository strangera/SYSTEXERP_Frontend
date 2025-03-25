import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS52030CRUComponent } from './tls52030-cru.component';

describe('TLS52030CRUComponent', () => {
  let component: TLS52030CRUComponent;
  let fixture: ComponentFixture<TLS52030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS52030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS52030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

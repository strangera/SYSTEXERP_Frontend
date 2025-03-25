import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2G040CRUComponent } from './tls2g040-cru.component';

describe('TLS2G040CRUComponent', () => {
  let component: TLS2G040CRUComponent;
  let fixture: ComponentFixture<TLS2G040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2G040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2G040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

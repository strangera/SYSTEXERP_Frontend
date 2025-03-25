import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51130CRUComponent } from './tls51130-cru.component';

describe('TLS51130CRUComponent', () => {
  let component: TLS51130CRUComponent;
  let fixture: ComponentFixture<TLS51130CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51130CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51130CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

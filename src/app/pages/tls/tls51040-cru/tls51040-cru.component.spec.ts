import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51040CRUComponent } from './tls51040-cru.component';

describe('TLS51040CRUComponent', () => {
  let component: TLS51040CRUComponent;
  let fixture: ComponentFixture<TLS51040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

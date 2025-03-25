import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51070CRUComponent } from './tls51070-cru.component';

describe('TLS51070CRUComponent', () => {
  let component: TLS51070CRUComponent;
  let fixture: ComponentFixture<TLS51070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

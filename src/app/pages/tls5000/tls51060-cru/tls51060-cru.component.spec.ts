import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS51060CRUComponent } from './tls51060-cru.component';

describe('TLS51060CRUComponent', () => {
  let component: TLS51060CRUComponent;
  let fixture: ComponentFixture<TLS51060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS51060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS51060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28010CRUComponent } from './tls28010-cru.component';

describe('TLS28010CRUComponent', () => {
  let component: TLS28010CRUComponent;
  let fixture: ComponentFixture<TLS28010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

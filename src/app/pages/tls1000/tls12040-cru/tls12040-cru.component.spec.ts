import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12040CRUComponent } from './tls12040-cru.component';

describe('TLS12040CRUComponent', () => {
  let component: TLS12040CRUComponent;
  let fixture: ComponentFixture<TLS12040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

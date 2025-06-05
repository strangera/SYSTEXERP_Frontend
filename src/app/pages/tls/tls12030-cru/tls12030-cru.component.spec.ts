import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS12030CRUComponent } from './tls12030-cru.component';

describe('TLS12030CRUComponent', () => {
  let component: TLS12030CRUComponent;
  let fixture: ComponentFixture<TLS12030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS12030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS12030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

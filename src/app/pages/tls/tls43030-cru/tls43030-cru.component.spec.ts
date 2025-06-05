import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43030CRUComponent } from './tls43030-cru.component';

describe('TLS43030CRUComponent', () => {
  let component: TLS43030CRUComponent;
  let fixture: ComponentFixture<TLS43030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

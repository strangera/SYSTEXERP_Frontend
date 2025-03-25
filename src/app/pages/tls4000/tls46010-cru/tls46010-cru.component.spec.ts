import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46010CRUComponent } from './tls46010-cru.component';

describe('TLS46010CRUComponent', () => {
  let component: TLS46010CRUComponent;
  let fixture: ComponentFixture<TLS46010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

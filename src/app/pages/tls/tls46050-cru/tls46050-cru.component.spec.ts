import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46050CRUComponent } from './tls46050-cru.component';

describe('TLS46050CRUComponent', () => {
  let component: TLS46050CRUComponent;
  let fixture: ComponentFixture<TLS46050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

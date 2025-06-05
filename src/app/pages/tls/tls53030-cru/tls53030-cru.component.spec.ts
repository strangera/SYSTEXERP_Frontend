import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS53030CRUComponent } from './tls53030-cru.component';

describe('TLS53030CRUComponent', () => {
  let component: TLS53030CRUComponent;
  let fixture: ComponentFixture<TLS53030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS53030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS53030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

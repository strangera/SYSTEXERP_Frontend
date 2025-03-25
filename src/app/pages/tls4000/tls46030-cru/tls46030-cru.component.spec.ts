import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46030CRUComponent } from './tls46030-cru.component';

describe('TLS46030CRUComponent', () => {
  let component: TLS46030CRUComponent;
  let fixture: ComponentFixture<TLS46030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

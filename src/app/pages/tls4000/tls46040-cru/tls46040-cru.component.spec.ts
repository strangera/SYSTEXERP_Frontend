import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS46040CRUComponent } from './tls46040-cru.component';

describe('TLS46040CRUComponent', () => {
  let component: TLS46040CRUComponent;
  let fixture: ComponentFixture<TLS46040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS46040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS46040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

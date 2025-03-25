import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS27050CRUComponent } from './tls27050-cru.component';

describe('TLS27050CRUComponent', () => {
  let component: TLS27050CRUComponent;
  let fixture: ComponentFixture<TLS27050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS27050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS27050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21050CRUComponent } from './tls21050-cru.component';

describe('TLS21050CRUComponent', () => {
  let component: TLS21050CRUComponent;
  let fixture: ComponentFixture<TLS21050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

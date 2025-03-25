import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS21030CRUComponent } from './tls21030-cru.component';

describe('TLS21030CRUComponent', () => {
  let component: TLS21030CRUComponent;
  let fixture: ComponentFixture<TLS21030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS21030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS21030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS25030CRUComponent } from './tls25030-cru.component';

describe('TLS25030CRUComponent', () => {
  let component: TLS25030CRUComponent;
  let fixture: ComponentFixture<TLS25030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS25030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS25030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

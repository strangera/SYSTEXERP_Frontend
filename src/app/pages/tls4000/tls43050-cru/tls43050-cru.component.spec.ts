import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS43050CRUComponent } from './tls43050-cru.component';

describe('TLS43050CRUComponent', () => {
  let component: TLS43050CRUComponent;
  let fixture: ComponentFixture<TLS43050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS43050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS43050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

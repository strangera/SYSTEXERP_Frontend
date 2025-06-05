import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28050CRUComponent } from './tls28050-cru.component';

describe('TLS28050CRUComponent', () => {
  let component: TLS28050CRUComponent;
  let fixture: ComponentFixture<TLS28050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

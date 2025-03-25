import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28030CRUComponent } from './tls28030-cru.component';

describe('TLS28030CRUComponent', () => {
  let component: TLS28030CRUComponent;
  let fixture: ComponentFixture<TLS28030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

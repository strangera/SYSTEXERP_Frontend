import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS28040CRUComponent } from './tls28040-cru.component';

describe('TLS28040CRUComponent', () => {
  let component: TLS28040CRUComponent;
  let fixture: ComponentFixture<TLS28040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS28040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS28040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

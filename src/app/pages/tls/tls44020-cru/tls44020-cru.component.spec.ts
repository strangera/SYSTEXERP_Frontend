import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS44020CRUComponent } from './tls44020-cru.component';

describe('TLS44020CRUComponent', () => {
  let component: TLS44020CRUComponent;
  let fixture: ComponentFixture<TLS44020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS44020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS44020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

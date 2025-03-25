import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS13030CRUComponent } from './tls13030-cru.component';

describe('TLS13030CRUComponent', () => {
  let component: TLS13030CRUComponent;
  let fixture: ComponentFixture<TLS13030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS13030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS13030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

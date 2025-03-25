import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TLS2J050CRUComponent } from './tls2j050-cru.component';

describe('TLS2J050CRUComponent', () => {
  let component: TLS2J050CRUComponent;
  let fixture: ComponentFixture<TLS2J050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TLS2J050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TLS2J050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

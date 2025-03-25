import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54010CRUComponent } from './fin54010-cru.component';

describe('FIN54010CRUComponent', () => {
  let component: FIN54010CRUComponent;
  let fixture: ComponentFixture<FIN54010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

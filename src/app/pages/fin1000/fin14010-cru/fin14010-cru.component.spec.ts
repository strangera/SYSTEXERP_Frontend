import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14010CRUComponent } from './fin14010-cru.component';

describe('FIN14010CRUComponent', () => {
  let component: FIN14010CRUComponent;
  let fixture: ComponentFixture<FIN14010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23050CRUComponent } from './fin23050-cru.component';

describe('FIN23050CRUComponent', () => {
  let component: FIN23050CRUComponent;
  let fixture: ComponentFixture<FIN23050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

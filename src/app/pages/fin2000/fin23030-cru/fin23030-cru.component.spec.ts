import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23030CRUComponent } from './fin23030-cru.component';

describe('FIN23030CRUComponent', () => {
  let component: FIN23030CRUComponent;
  let fixture: ComponentFixture<FIN23030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23010CRUComponent } from './fin23010-cru.component';

describe('FIN23010CRUComponent', () => {
  let component: FIN23010CRUComponent;
  let fixture: ComponentFixture<FIN23010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

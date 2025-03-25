import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64030CRUComponent } from './fin64030-cru.component';

describe('FIN64030CRUComponent', () => {
  let component: FIN64030CRUComponent;
  let fixture: ComponentFixture<FIN64030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

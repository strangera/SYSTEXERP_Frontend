import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52030CRUComponent } from './fin52030-cru.component';

describe('FIN52030CRUComponent', () => {
  let component: FIN52030CRUComponent;
  let fixture: ComponentFixture<FIN52030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

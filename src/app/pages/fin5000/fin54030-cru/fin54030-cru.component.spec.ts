import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54030CRUComponent } from './fin54030-cru.component';

describe('FIN54030CRUComponent', () => {
  let component: FIN54030CRUComponent;
  let fixture: ComponentFixture<FIN54030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

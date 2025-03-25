import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72050CRUComponent } from './fin72050-cru.component';

describe('FIN72050CRUComponent', () => {
  let component: FIN72050CRUComponent;
  let fixture: ComponentFixture<FIN72050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

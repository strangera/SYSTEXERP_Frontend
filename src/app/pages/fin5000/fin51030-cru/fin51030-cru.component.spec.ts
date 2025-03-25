import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51030CRUComponent } from './fin51030-cru.component';

describe('FIN51030CRUComponent', () => {
  let component: FIN51030CRUComponent;
  let fixture: ComponentFixture<FIN51030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

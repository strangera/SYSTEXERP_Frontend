import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51050CRUComponent } from './fin51050-cru.component';

describe('FIN51050CRUComponent', () => {
  let component: FIN51050CRUComponent;
  let fixture: ComponentFixture<FIN51050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

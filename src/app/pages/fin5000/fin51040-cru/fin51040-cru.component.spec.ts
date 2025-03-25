import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51040CRUComponent } from './fin51040-cru.component';

describe('FIN51040CRUComponent', () => {
  let component: FIN51040CRUComponent;
  let fixture: ComponentFixture<FIN51040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55050CRUComponent } from './fin55050-cru.component';

describe('FIN55050CRUComponent', () => {
  let component: FIN55050CRUComponent;
  let fixture: ComponentFixture<FIN55050CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55050CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55050CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

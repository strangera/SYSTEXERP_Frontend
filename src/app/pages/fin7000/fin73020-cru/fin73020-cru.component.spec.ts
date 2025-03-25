import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN73020CRUComponent } from './fin73020-cru.component';

describe('FIN73020CRUComponent', () => {
  let component: FIN73020CRUComponent;
  let fixture: ComponentFixture<FIN73020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN73020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN73020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

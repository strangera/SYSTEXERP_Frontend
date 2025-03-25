import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN28020CRUComponent } from './fin28020-cru.component';

describe('FIN28020CRUComponent', () => {
  let component: FIN28020CRUComponent;
  let fixture: ComponentFixture<FIN28020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN28020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN28020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

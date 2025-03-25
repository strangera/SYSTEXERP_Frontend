import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN61020CRUComponent } from './fin61020-cru.component';

describe('FIN61020CRUComponent', () => {
  let component: FIN61020CRUComponent;
  let fixture: ComponentFixture<FIN61020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN61020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN61020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

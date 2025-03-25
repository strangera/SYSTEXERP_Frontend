import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN12020CRUComponent } from './fin12020-cru.component';

describe('FIN12020CRUComponent', () => {
  let component: FIN12020CRUComponent;
  let fixture: ComponentFixture<FIN12020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN12020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN12020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

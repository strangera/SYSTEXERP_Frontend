import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35020CRUComponent } from './fin35020-cru.component';

describe('FIN35020CRUComponent', () => {
  let component: FIN35020CRUComponent;
  let fixture: ComponentFixture<FIN35020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

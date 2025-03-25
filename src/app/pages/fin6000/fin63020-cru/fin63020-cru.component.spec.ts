import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN63020CRUComponent } from './fin63020-cru.component';

describe('FIN63020CRUComponent', () => {
  let component: FIN63020CRUComponent;
  let fixture: ComponentFixture<FIN63020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN63020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN63020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

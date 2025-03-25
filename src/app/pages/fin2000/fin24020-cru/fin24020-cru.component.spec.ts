import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN24020CRUComponent } from './fin24020-cru.component';

describe('FIN24020CRUComponent', () => {
  let component: FIN24020CRUComponent;
  let fixture: ComponentFixture<FIN24020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN24020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN24020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

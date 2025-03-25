import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN71020CRUComponent } from './fin71020-cru.component';

describe('FIN71020CRUComponent', () => {
  let component: FIN71020CRUComponent;
  let fixture: ComponentFixture<FIN71020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN71020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN71020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

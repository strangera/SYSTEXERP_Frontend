import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41020CRUComponent } from './fin41020-cru.component';

describe('FIN41020CRUComponent', () => {
  let component: FIN41020CRUComponent;
  let fixture: ComponentFixture<FIN41020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

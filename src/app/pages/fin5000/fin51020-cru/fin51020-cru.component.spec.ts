import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51020CRUComponent } from './fin51020-cru.component';

describe('FIN51020CRUComponent', () => {
  let component: FIN51020CRUComponent;
  let fixture: ComponentFixture<FIN51020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

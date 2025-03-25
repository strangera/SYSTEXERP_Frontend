import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64020CRUComponent } from './fin64020-cru.component';

describe('FIN64020CRUComponent', () => {
  let component: FIN64020CRUComponent;
  let fixture: ComponentFixture<FIN64020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

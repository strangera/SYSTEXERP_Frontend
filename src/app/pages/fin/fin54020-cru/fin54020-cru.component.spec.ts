import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54020CRUComponent } from './fin54020-cru.component';

describe('FIN54020CRUComponent', () => {
  let component: FIN54020CRUComponent;
  let fixture: ComponentFixture<FIN54020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

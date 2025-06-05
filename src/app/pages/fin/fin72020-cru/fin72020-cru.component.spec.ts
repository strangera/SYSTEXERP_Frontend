import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72020CRUComponent } from './fin72020-cru.component';

describe('FIN72020CRUComponent', () => {
  let component: FIN72020CRUComponent;
  let fixture: ComponentFixture<FIN72020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

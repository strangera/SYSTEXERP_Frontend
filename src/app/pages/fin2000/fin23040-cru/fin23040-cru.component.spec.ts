import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23040CRUComponent } from './fin23040-cru.component';

describe('FIN23040CRUComponent', () => {
  let component: FIN23040CRUComponent;
  let fixture: ComponentFixture<FIN23040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15030CRUComponent } from './fin15030-cru.component';

describe('FIN15030CRUComponent', () => {
  let component: FIN15030CRUComponent;
  let fixture: ComponentFixture<FIN15030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

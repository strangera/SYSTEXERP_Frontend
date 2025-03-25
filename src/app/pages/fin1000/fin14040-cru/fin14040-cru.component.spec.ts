import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN14040CRUComponent } from './fin14040-cru.component';

describe('FIN14040CRUComponent', () => {
  let component: FIN14040CRUComponent;
  let fixture: ComponentFixture<FIN14040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN14040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN14040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

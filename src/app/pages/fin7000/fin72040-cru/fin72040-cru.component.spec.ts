import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72040CRUComponent } from './fin72040-cru.component';

describe('FIN72040CRUComponent', () => {
  let component: FIN72040CRUComponent;
  let fixture: ComponentFixture<FIN72040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

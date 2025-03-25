import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN41040CRUComponent } from './fin41040-cru.component';

describe('FIN41040CRUComponent', () => {
  let component: FIN41040CRUComponent;
  let fixture: ComponentFixture<FIN41040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN41040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN41040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

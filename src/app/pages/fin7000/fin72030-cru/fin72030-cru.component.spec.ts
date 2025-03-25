import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN72030CRUComponent } from './fin72030-cru.component';

describe('FIN72030CRUComponent', () => {
  let component: FIN72030CRUComponent;
  let fixture: ComponentFixture<FIN72030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN72030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN72030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

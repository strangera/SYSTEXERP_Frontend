import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55030CRUComponent } from './fin55030-cru.component';

describe('FIN55030CRUComponent', () => {
  let component: FIN55030CRUComponent;
  let fixture: ComponentFixture<FIN55030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

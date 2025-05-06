import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55040CRUComponent } from './fin55040-cru.component';

describe('FIN55040CRUComponent', () => {
  let component: FIN55040CRUComponent;
  let fixture: ComponentFixture<FIN55040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

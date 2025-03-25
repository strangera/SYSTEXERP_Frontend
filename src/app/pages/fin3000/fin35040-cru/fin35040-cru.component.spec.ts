import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35040CRUComponent } from './fin35040-cru.component';

describe('FIN35040CRUComponent', () => {
  let component: FIN35040CRUComponent;
  let fixture: ComponentFixture<FIN35040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

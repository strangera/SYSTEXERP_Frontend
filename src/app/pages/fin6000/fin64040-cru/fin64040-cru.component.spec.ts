import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN64040CRUComponent } from './fin64040-cru.component';

describe('FIN64040CRUComponent', () => {
  let component: FIN64040CRUComponent;
  let fixture: ComponentFixture<FIN64040CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN64040CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN64040CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

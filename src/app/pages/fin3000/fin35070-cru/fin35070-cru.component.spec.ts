import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35070CRUComponent } from './fin35070-cru.component';

describe('FIN35070CRUComponent', () => {
  let component: FIN35070CRUComponent;
  let fixture: ComponentFixture<FIN35070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

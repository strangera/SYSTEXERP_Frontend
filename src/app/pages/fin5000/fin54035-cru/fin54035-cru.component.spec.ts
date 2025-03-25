import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN54035CRUComponent } from './fin54035-cru.component';

describe('FIN54035CRUComponent', () => {
  let component: FIN54035CRUComponent;
  let fixture: ComponentFixture<FIN54035CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN54035CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN54035CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

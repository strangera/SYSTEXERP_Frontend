import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11080CRUComponent } from './fin11080-cru.component';

describe('FIN11080CRUComponent', () => {
  let component: FIN11080CRUComponent;
  let fixture: ComponentFixture<FIN11080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

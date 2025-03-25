import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55100CRUComponent } from './fin55100-cru.component';

describe('FIN55100CRUComponent', () => {
  let component: FIN55100CRUComponent;
  let fixture: ComponentFixture<FIN55100CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55100CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55100CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

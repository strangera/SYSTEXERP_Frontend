import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55080CRUComponent } from './fin55080-cru.component';

describe('FIN55080CRUComponent', () => {
  let component: FIN55080CRUComponent;
  let fixture: ComponentFixture<FIN55080CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55080CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55080CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

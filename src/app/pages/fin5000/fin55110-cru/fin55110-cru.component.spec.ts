import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55110CRUComponent } from './fin55110-cru.component';

describe('FIN55110CRUComponent', () => {
  let component: FIN55110CRUComponent;
  let fixture: ComponentFixture<FIN55110CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55110CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55110CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

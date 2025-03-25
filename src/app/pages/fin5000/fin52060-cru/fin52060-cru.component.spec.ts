import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN52060CRUComponent } from './fin52060-cru.component';

describe('FIN52060CRUComponent', () => {
  let component: FIN52060CRUComponent;
  let fixture: ComponentFixture<FIN52060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN52060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN52060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

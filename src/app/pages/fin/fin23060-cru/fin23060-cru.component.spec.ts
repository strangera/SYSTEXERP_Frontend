import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN23060CRUComponent } from './fin23060-cru.component';

describe('FIN23060CRUComponent', () => {
  let component: FIN23060CRUComponent;
  let fixture: ComponentFixture<FIN23060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN23060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN23060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

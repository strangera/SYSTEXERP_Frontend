import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29060CRUComponent } from './fin29060-cru.component';

describe('FIN29060CRUComponent', () => {
  let component: FIN29060CRUComponent;
  let fixture: ComponentFixture<FIN29060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

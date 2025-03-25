import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51060CRUComponent } from './fin51060-cru.component';

describe('FIN51060CRUComponent', () => {
  let component: FIN51060CRUComponent;
  let fixture: ComponentFixture<FIN51060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

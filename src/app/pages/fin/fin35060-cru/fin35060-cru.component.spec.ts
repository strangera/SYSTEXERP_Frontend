import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN35060CRUComponent } from './fin35060-cru.component';

describe('FIN35060CRUComponent', () => {
  let component: FIN35060CRUComponent;
  let fixture: ComponentFixture<FIN35060CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN35060CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN35060CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

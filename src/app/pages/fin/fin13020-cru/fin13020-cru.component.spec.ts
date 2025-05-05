import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN13020CRUComponent } from './fin13020-cru.component';

describe('FIN13020CRUComponent', () => {
  let component: FIN13020CRUComponent;
  let fixture: ComponentFixture<FIN13020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN13020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN13020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

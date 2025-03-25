import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN15020CRUComponent } from './fin15020-cru.component';

describe('FIN15020CRUComponent', () => {
  let component: FIN15020CRUComponent;
  let fixture: ComponentFixture<FIN15020CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN15020CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN15020CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

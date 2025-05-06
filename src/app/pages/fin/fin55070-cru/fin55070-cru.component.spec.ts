import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN55070CRUComponent } from './fin55070-cru.component';

describe('FIN55070CRUComponent', () => {
  let component: FIN55070CRUComponent;
  let fixture: ComponentFixture<FIN55070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN55070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN55070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

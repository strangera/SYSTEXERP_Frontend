import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29070CRUComponent } from './fin29070-cru.component';

describe('FIN29070CRUComponent', () => {
  let component: FIN29070CRUComponent;
  let fixture: ComponentFixture<FIN29070CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29070CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29070CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

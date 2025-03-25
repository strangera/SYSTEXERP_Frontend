import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29120CRUComponent } from './fin29120-cru.component';

describe('FIN29120CRUComponent', () => {
  let component: FIN29120CRUComponent;
  let fixture: ComponentFixture<FIN29120CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29120CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29120CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

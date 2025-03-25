import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN29030CRUComponent } from './fin29030-cru.component';

describe('FIN29030CRUComponent', () => {
  let component: FIN29030CRUComponent;
  let fixture: ComponentFixture<FIN29030CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN29030CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN29030CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

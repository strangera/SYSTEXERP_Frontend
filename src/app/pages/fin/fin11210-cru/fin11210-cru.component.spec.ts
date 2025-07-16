import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN11210CruComponent } from './fin11210-cru.component';

describe('FIN11210CruComponent', () => {
  let component: FIN11210CruComponent;
  let fixture: ComponentFixture<FIN11210CruComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN11210CruComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN11210CruComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

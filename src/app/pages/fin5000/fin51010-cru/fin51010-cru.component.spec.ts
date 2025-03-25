import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FIN51010CRUComponent } from './fin51010-cru.component';

describe('FIN51010CRUComponent', () => {
  let component: FIN51010CRUComponent;
  let fixture: ComponentFixture<FIN51010CRUComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FIN51010CRUComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FIN51010CRUComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

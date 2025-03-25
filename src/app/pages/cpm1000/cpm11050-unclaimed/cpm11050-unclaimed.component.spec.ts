import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cpm11050UnclaimedComponent } from './cpm11050-unclaimed.component';

describe('Cpm11050UnclaimedComponent', () => {
  let component: Cpm11050UnclaimedComponent;
  let fixture: ComponentFixture<Cpm11050UnclaimedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cpm11050UnclaimedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cpm11050UnclaimedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

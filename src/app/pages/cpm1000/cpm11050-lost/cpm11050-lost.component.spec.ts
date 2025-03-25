import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cpm11050LostComponent } from './cpm11050-lost.component';

describe('Cpm11050LostComponent', () => {
  let component: Cpm11050LostComponent;
  let fixture: ComponentFixture<Cpm11050LostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cpm11050LostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cpm11050LostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cpm11050FoundComponent } from './cpm11050-found.component';

describe('Cpm11050FoundComponent', () => {
  let component: Cpm11050FoundComponent;
  let fixture: ComponentFixture<Cpm11050FoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cpm11050FoundComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cpm11050FoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyAgeComponent } from './verify-age.component';

describe('VerifyAgeComponent', () => {
  let component: VerifyAgeComponent;
  let fixture: ComponentFixture<VerifyAgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [VerifyAgeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerifyAgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WatchingPageComponent } from './watching-page.component';

describe('WatchingPageComponent', () => {
  let component: WatchingPageComponent;
  let fixture: ComponentFixture<WatchingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WatchingPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WatchingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

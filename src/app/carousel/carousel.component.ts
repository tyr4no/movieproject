import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';

@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
})
export class CarouselComponent implements OnInit, OnChanges {
  @Input() items: any[] = [];
  @Output() verifyRequested = new EventEmitter<any>();
  @Output() trailer = new EventEmitter<any>();
  @Input() isAnimation = false;
  
  numVisible = 5;
  responsiveOptions: any[] = [];
  private animationTimeout: any;

  ngOnInit() {
    this.updateResponsiveOptions(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isAnimation'] && !changes['isAnimation'].firstChange) {
      this.syncWithAnimation();
    }
  }

  private syncWithAnimation() {
    // Clear any pending timeout
    clearTimeout(this.animationTimeout);
    
    if (this.isAnimation) {
      // When panel is opening (animation starts)
      this.numVisible = 4;
      this.updateResponsiveOptions(true);
    } else {
      // When panel is closing (animation starts)
      // Wait for animation to complete (300ms) before updating
      this.animationTimeout = setTimeout(() => {
        this.numVisible = 5;
        this.updateResponsiveOptions(false);
      }, 300); // Match this duration with your CSS animation
    }
  }

  private updateResponsiveOptions(isAnimating: boolean) {
    if (isAnimating) {
      // Options during panel open animation
      this.responsiveOptions = [
        {
          breakpoint: '1400px',
          numVisible: 3,
          numScroll: 2,
        },
        {
          breakpoint: '1174px',
          numVisible: 2,
          numScroll: 1,
        },
        {
          breakpoint: '990px',
          numVisible: 1,
          numScroll: 1,
        }
      ];
    } else {
      // Options when panel is fully closed
      this.responsiveOptions = [
        {
          breakpoint: '1400px',
          numVisible: 4,
          numScroll: 2,
        },
        {
          breakpoint: '1174px',
          numVisible: 3,
          numScroll: 1,
        },
        {
          breakpoint: '990px',
          numVisible: 2,
          numScroll: 1,
        },
        {
          breakpoint: '620px',
          numVisible: 1,
          numScroll: 1,
        }
      ];
    }
  }

  ngOnDestroy() {
    clearTimeout(this.animationTimeout);
  }

  emitTrailer(item: any) {
    this.trailer.emit(item);
  }

  verifyRequest() {
    this.verifyRequested.emit();
  }
}
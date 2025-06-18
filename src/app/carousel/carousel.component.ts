import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnInit,
} from '@angular/core';

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

  ngOnInit() {
    this.updateResponsiveOptions(false);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isAnimation']) {
      this.syncWithAnimation();
    }
  }

  private syncWithAnimation() {

    if (this.isAnimation) {
      setTimeout(() => {
        this.numVisible = 4;
        this.updateResponsiveOptions(true);
      }, 350);
    } else {

      setTimeout(() => {
        this.numVisible = 5;
        this.updateResponsiveOptions(false);
      }, 200);
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
          breakpoint: '950px',
          numVisible: 1,
          numScroll: 1,
        },
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
          breakpoint: '800px',
          numVisible: 2,
          numScroll: 1,
        },
        {
          breakpoint: '500px',
          numVisible: 1,
          numScroll: 1,
        },
      ];
    }
  }

  

  emitTrailer(item: any) {
    this.trailer.emit(item);
  }

  verifyRequest() {
    this.verifyRequested.emit();
  }
}

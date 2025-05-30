import { Input, Output, EventEmitter, Component } from '@angular/core';
@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css',
})
export class CarouselComponent {
  @Input() items: any[] = [];
  @Output() trailer = new EventEmitter<any>();
  responsiveOptions = [
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
    },
    
  ];

  emitTrailer(id: number) {
    this.trailer.emit(id);
  }
}

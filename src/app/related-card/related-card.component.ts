import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';
@Component({
  selector: 'app-related-card',
  templateUrl: './related-card.component.html',
  styleUrls: ['./related-card.component.css'],
})
export class RelatedCardComponent {
  @Input() item: any;
  trailerKey: string | null = null;
  ngOnInit() {
    setTimeout(() => {
      if (this.item) {
      }
    }, 1000);
  }
  constructor(private router: Router, private tmdbService: TmdbService) {}
  goToRelatedItem() {
    console.log('Navigating with:', this.item);

    const type = this.item.number_of_seasons ? 'tv' : 'movie';
    if (type === 'tv') {
      this.tmdbService.getTvTrailer(this.item.id).subscribe((res) => {
        this.trailerKey = res;
        this.router.navigate(['/watch', type, this.item.id, this.trailerKey]);
      });
    } else {
      this.tmdbService.getMovieTrailer(this.item.id).subscribe((res) => {
        this.trailerKey = res;
        this.router.navigate(['/watch', type, this.item.id, this.trailerKey]);
      });
    }
  }
}

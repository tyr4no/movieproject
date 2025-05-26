import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';
import { Router } from '@angular/router';
@Component({
  selector: 'movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css'],
})
export class MovieDetailsComponent {
  movie: any = null;
  lastSearch: string = '';

  constructor(
    private route: ActivatedRoute,
    private tmdbService: TmdbService,
    private router: Router
  ) {}

}

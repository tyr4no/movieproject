import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TmdbService } from '../services/tmdb.service';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
  selector: 'app-watching-page',
  templateUrl: './watching-page.component.html',
  styleUrls: ['./watching-page.component.css'],
})
export class WatchingPageComponent implements OnInit {
  @ViewChild('ytPlayer') ytPlayer!: YouTubePlayer;

  type: 'movie' | 'tv' = 'movie';
  trailerKey: string = '';
  movieId = 0;
  isTVShow = false;

  seasonOptions: any[] = [];
  episodeOptions: any[] = [];

  selectedSeason: number | null = null;
  selectedEpisode: number | null = null;
  selectedEpisodeName: string | null = null;

  playerVars = {
    autoplay: 0,
    controls: 1,
    modestbranding: 1,
    rel: 0,
    iv_load_policy: 3,
  };

  constructor(
    private route: ActivatedRoute,
    private tmdbService: TmdbService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.movieId = params['id'];
      this.trailerKey = params['key'];
      this.type = params['type'];

      if (this.type === 'tv') {
        this.isTVShow = true;
        this.loadSeasons();
      } else {
        this.isTVShow = false;
      }
    });
  }

  loadSeasons() {
    this.tmdbService.getTVDetails(this.movieId).subscribe((data: any) => {
      this.seasonOptions = data.seasons
        .filter((s: any) => s.season_number !== 0) // remove season 0
        .map((season: any) => ({
          label: `Season ${season.season_number}`,
          value: season.season_number,
        }));

      if (this.seasonOptions.length) {
        this.selectedSeason = this.seasonOptions[0].value;
        if (this.selectedSeason !== null) {
          this.loadEpisodes(this.selectedSeason);
        }
      }
    });
  }

  loadEpisodes(seasonNumber: number) {
    this.tmdbService.getSeasonEpisodes(this.movieId, seasonNumber).subscribe((data: any) => {
      this.episodeOptions = data.episodes.map((ep: any) => ({
        label: `Episode ${ep.episode_number}: ${ep.name}`,
        value: ep.episode_number,
        duration: `${ep.runtime} minutes` || 'Unknown'
      }));

      this.selectedEpisode = null;
      this.selectedEpisodeName = null;
    });
  }

  onSeasonChange(event: Event) {
    const seasonNum = +(event.target as HTMLSelectElement).value;
    this.selectedSeason = seasonNum;
    this.loadEpisodes(seasonNum);
  }

  onEpisodeSelect(episodeValue: number) {
    this.selectedEpisode = episodeValue;

    const episode = this.episodeOptions.find(
      (ep) => ep.value === episodeValue
    );

    if (episode) {
      this.selectedEpisodeName = episode.label.split(': ')[1] || episode.label;
    } else {
      this.selectedEpisodeName = null;
    }

    const tempKey = this.trailerKey;
    this.trailerKey = '';
    setTimeout(() => {
      this.trailerKey = tempKey;
    });
  }

  onPlayerReady() {}
}

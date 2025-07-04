import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';

import { MainPageComponent } from './main-page/main-page.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { TvShowsPageComponent } from './tv-shows-page/tv-shows-page.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { WatchingPageComponent } from './watching-page/watching-page.component';
import { LoginComponent } from './pages/login/login.component';
const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: MainPageComponent,
        // canActivate: [authGuard],
      },
      {
        path: 'movies',
        component: MovieListComponent,
        // canActivate: [authGuard],
      },
      {
        path: 'tv-shows',
        component: TvShowsPageComponent,
        // canActivate: [authGuard],
      },
      { path: 'watch/:type/:id/:key', component: WatchingPageComponent }

    ],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [{ path: 'login', component: LoginComponent }],
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

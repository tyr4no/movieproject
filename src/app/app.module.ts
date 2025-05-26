import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'; // ← THIS LINE!
import Aura from '@primeng/themes/aura';
import { SelectModule } from 'primeng/select';
import { InputOtpModule } from 'primeng/inputotp';
import { ButtonModule } from 'primeng/button';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DropdownModule } from 'primeng/dropdown';
import { CarouselModule } from 'primeng/carousel';
import { Message, MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';

import { MainPageComponent } from './main-page/main-page.component';
import { MovieListComponent } from './movie-list/movie-list.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { TvShowsPageComponent } from './tv-shows-page/tv-shows-page.component';
import { RatingModule } from 'primeng/rating';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { DialogModule } from 'primeng/dialog';
import { MovieAndTvCardComponent } from './movie-and-tv-card/movie-and-tv-card.component';
import { TrailerComponent } from './trailer/trailer.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ToggleThemeComponent } from './toogle-theme/toogle-theme.component';
import { ChatbotComponent } from './chatbot/chatbot.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { TooltipModule } from 'primeng/tooltip';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { PopoverModule } from 'primeng/popover';
import { SkeletonModule } from 'primeng/skeleton';
import { CarouselComponent } from './carousel/carousel.component';

@NgModule({
  declarations: [
    AppComponent,
    ToggleThemeComponent,
    MainPageComponent,
    MovieListComponent,
    MovieDetailsComponent,
    ChatbotComponent,
    TvShowsPageComponent,
    MovieAndTvCardComponent,
    TrailerComponent,
    MainLayoutComponent,
    AuthLayoutComponent,
    LoginComponent,
    SignupComponent,
    CarouselComponent,
  ],
  imports: [
    BrowserModule,
    MenubarModule,
    InputIconModule,
    PopoverModule,
    PasswordModule,
    ToastModule,
    SkeletonModule,
    MessageModule,
    YouTubePlayerModule,
    ReactiveFormsModule,
    IconFieldModule,
    TooltipModule,
    ScrollPanelModule,
    RouterLink,
    ProgressSpinnerModule,
    CheckboxModule,
    InputTextModule,
    DialogModule,
    RatingModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    CarouselModule,
    SelectModule,
    InputOtpModule,
    ButtonModule,
  ], // ← AND THIS
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
    MessageService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

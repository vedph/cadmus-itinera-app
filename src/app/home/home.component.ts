import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';

@Component({
  selector: 'cadmus-home',
  imports: [
    AsyncPipe,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public user$: Observable<User | null>;

  constructor(authService: AuthJwtService) {
    this.user$ = authService.currentUser$;
  }
}

import { Component } from '@angular/core';
import { AuthJwtService, User } from '@myrmidon/auth-jwt-login';
import { Observable } from 'rxjs';

@Component({
  selector: 'cadmus-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: false,
})
export class HomeComponent {
  public user$: Observable<User | null>;

  constructor(authService: AuthJwtService) {
    this.user$ = authService.currentUser$;
  }
}

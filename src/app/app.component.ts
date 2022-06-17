import { Component, OnInit, Inject } from '@angular/core';
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AppService, AppQuery } from '@myrmidon/cadmus-state';
import { Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  AuthJwtService,
  GravatarService,
  User,
} from '@myrmidon/auth-jwt-login';
import { EnvService } from '@myrmidon/ng-tools';
import { FormBuilder, FormControl } from '@angular/forms';

import { ViafRefLookupService } from '@myrmidon/cadmus-refs-viaf-lookup';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  public user?: User;
  public logged?: boolean;
  public itemBrowsers?: ThesaurusEntry[];
  public version: string;
  public snavToggle: FormControl<boolean>;

  constructor(
    @Inject('itemBrowserKeys')
    private _itemBrowserKeys: { [key: string]: string },
    private _authService: AuthJwtService,
    private _gravatarService: GravatarService,
    private _appService: AppService,
    private _appQuery: AppQuery,
    private _router: Router,
    public viafService: ViafRefLookupService,
    private _clipboard: Clipboard,
    private _snackbar: MatSnackBar,
    env: EnvService,
    formBuilder: FormBuilder
  ) {
    this.version = env.get('version') || '';
    this.snavToggle = formBuilder.control(false, { nonNullable: true });
  }

  ngOnInit(): void {
    this.user = this._authService.currentUserValue || undefined;
    this.logged = this.user !== null;

    this._authService.currentUser$.subscribe((user: User | null) => {
      this.logged = this._authService.isAuthenticated(true);
      this.user = user || undefined;
      // load the general app state just once
      if (user) {
        this._appService.load();
      }
    });

    this._appQuery
      .selectItemBrowserThesaurus()
      .subscribe((thesaurus: Thesaurus | undefined) => {
        this.itemBrowsers = thesaurus ? thesaurus.entries : undefined;
      });
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
  }

  public getGravatarUrl(email: string, size = 80): string | null {
    return this._gravatarService.buildGravatarUrl(email, size);
  }

  public logout(): void {
    if (!this.logged) {
      return;
    }
    this._authService
      .logout()
      .pipe(take(1))
      .subscribe((_) => {
        this._router.navigate(['/home']);
      });
  }

  public onViafItemChange(item: any | undefined): void {
    if (item?.viafid) {
      this._clipboard.copy(item.viafid);
      this._snackbar.open('VIAF ID copied', 'OK', {
        duration: 1500,
      });
    }
  }
}

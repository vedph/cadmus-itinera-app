import { Component, OnInit, Inject } from '@angular/core';
import { Thesaurus, ThesaurusEntry } from '@myrmidon/cadmus-core';
import { AppRepository } from '@myrmidon/cadmus-state';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Clipboard } from '@angular/cdk/clipboard';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { EnvService, RamStorageService } from '@myrmidon/ngx-tools';
import { AuthJwtService, GravatarPipe, User } from '@myrmidon/auth-jwt-login';
import { ViafRefLookupService } from '@myrmidon/cadmus-refs-viaf-lookup';
import { ScopedPinLookupComponent } from '@myrmidon/cadmus-refs-asserted-ids';

import { WorkRefLookupService } from '@myrmidon/cadmus-biblio-ui';
import {
  LOOKUP_CONFIGS_KEY,
  RefLookupComponent,
} from '@myrmidon/cadmus-refs-lookup';
import { CodLocationConverterComponent } from '@myrmidon/cadmus-part-codicology-sheet-labels';

@Component({
  selector: 'app-root',
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatToolbarModule,
    MatTooltipModule,
    RefLookupComponent,
    ScopedPinLookupComponent,
    CodLocationConverterComponent,
    GravatarPipe,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  public user?: User;
  public logged?: boolean;
  public itemBrowsers?: ThesaurusEntry[];
  public version: string;
  public snavToggle: FormControl<boolean>;
  public isHome = false;

  constructor(
    @Inject('itemBrowserKeys')
    private _itemBrowserKeys: { [key: string]: string },
    private _authService: AuthJwtService,
    private _repository: AppRepository,
    private _router: Router,
    public viafService: ViafRefLookupService,
    private _clipboard: Clipboard,
    private _snackbar: MatSnackBar,
    workService: WorkRefLookupService,
    env: EnvService,
    storage: RamStorageService,
    formBuilder: FormBuilder
  ) {
    this.version = env.get('version') || '';
    this.snavToggle = formBuilder.control(false, { nonNullable: true });

    this._router.events.pipe(takeUntilDestroyed()).subscribe(() => {
      this.isHome = this._router.url === '/home' || this._router.url === '/';
    });

    // configure external lookup for asserted composite IDs
    storage.store(LOOKUP_CONFIGS_KEY, [
      {
        name: 'biblio',
        iconUrl: '/img/biblio128.png',
        description: 'Itinera bibliography',
        label: 'ID',
        service: workService,
        itemIdGetter: (item: any) => item?.id,
        itemLabelGetter: (item: any) => item?.key || item?.title,
      },
      {
        name: 'VIAF',
        iconUrl: '/img/viaf128.png',
        description: 'Virtual International Authority File',
        label: 'ID',
        service: viafService,
        itemIdGetter: (item: any) => item?.viafid,
        itemLabelGetter: (item: any) => item?.term,
      },
    ]);
  }

  public ngOnInit(): void {
    this.user = this._authService.currentUserValue || undefined;
    this.logged = this.user !== null;

    this._authService.currentUser$.subscribe((user: User | null) => {
      this.logged = this._authService.isAuthenticated(true);
      this.user = user || undefined;
      // load the general app state just once
      if (user) {
        this._repository.load();
      }
    });

    this._repository.itemBrowserThesaurus$.subscribe(
      (thesaurus: Thesaurus | undefined) => {
        this.itemBrowsers = thesaurus ? thesaurus.entries : undefined;
      }
    );
  }

  public getItemBrowserRoute(id: string): string {
    return this._itemBrowserKeys[id] || id;
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

  public onIdPick(id: string): void {
    this._clipboard.copy(id);
    this._snackbar.open('ID copied', 'OK', {
      duration: 1500,
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

import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientJsonpModule, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// material
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTreeModule } from '@angular/material/tree';
import { ClipboardModule } from '@angular/cdk/clipboard';

// ngx-monaco
import { MonacoEditorModule } from 'ngx-monaco-editor';
// ngx-markdown
import { MarkdownModule } from 'ngx-markdown';
// ELF
import { devTools } from '@ngneat/elf-devtools';
import { Actions } from '@ngneat/effects-ng';

// myrmidon
import { NgxDirtyCheckModule } from '@myrmidon/ngx-dirty-check';
import { EnvServiceProvider, NgToolsModule } from '@myrmidon/ng-tools';
import { NgMatToolsModule } from '@myrmidon/ng-mat-tools';
import {
  AuthJwtInterceptor,
  AuthJwtLoginModule,
} from '@myrmidon/auth-jwt-login';
import { AuthJwtAdminModule } from '@myrmidon/auth-jwt-admin';

// cadmus bricks
import { CadmusCodLocationModule } from '@myrmidon/cadmus-cod-location';
import { CadmusRefsDocReferencesModule } from '@myrmidon/cadmus-refs-doc-references';
import { CadmusRefsHistoricalDateModule } from '@myrmidon/cadmus-refs-historical-date';
import { CadmusRefsAssertedIdsModule } from '@myrmidon/cadmus-refs-asserted-ids';
import { CadmusRefsLookupModule } from '@myrmidon/cadmus-refs-lookup';
import { CadmusRefsViafLookupModule } from '@myrmidon/cadmus-refs-viaf-lookup';

// cadmus libs
import { CadmusApiModule } from '@myrmidon/cadmus-api';
import { CadmusBiblioUiModule } from '@myrmidon/cadmus-biblio-ui';
import { CadmusCoreModule } from '@myrmidon/cadmus-core';
import { CadmusProfileCoreModule } from '@myrmidon/cadmus-profile-core';
import { CadmusStateModule } from '@myrmidon/cadmus-state';
import { CadmusUiModule } from '@myrmidon/cadmus-ui';
import { CadmusUiPgModule } from '@myrmidon/cadmus-ui-pg';
import { CadmusCodicologyUiModule } from '@myrmidon/cadmus-codicology-ui';
import { CadmusTextBlockViewModule } from '@myrmidon/cadmus-text-block-view';
import { CadmusPreviewUiModule } from '@myrmidon/cadmus-preview-ui';
import { CadmusPreviewPgModule } from '@myrmidon/cadmus-preview-pg';

// for tools
import { CadmusPartCodicologySheetLabelsModule } from '@myrmidon/cadmus-part-codicology-sheet-labels';

// locals
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ManageUsersPageComponent } from './manage-users-page/manage-users-page.component';
import { RegisterUserPageComponent } from './register-user-page/register-user-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { PART_EDITOR_KEYS } from './part-editor-keys';
import { INDEX_LOOKUP_DEFINITIONS } from './index-lookup-definitions';
import { ITEM_BROWSER_KEYS } from './item-browser-keys';
import { BiblioPageComponent } from './biblio-page/biblio-page.component';

// https://ngneat.github.io/elf/docs/dev-tools/
export function initElfDevTools(actions: Actions) {
  return () => {
    devTools({
      name: 'Cadmus TGR',
      actionsDispatcher: actions,
    });
  };
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginPageComponent,
    ManageUsersPageComponent,
    RegisterUserPageComponent,
    ResetPasswordComponent,
    BiblioPageComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    // required by VIAF JSONP
    // note: this module must be listed BEFORE HttpClientModule!
    // https://github.com/angular/angular/issues/47312
    HttpClientJsonpModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    // material
    DragDropModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatSelectModule,
    MatSidenavModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatSnackBarModule,
    MatTableModule,
    MatTabsModule,
    MatTooltipModule,
    MatToolbarModule,
    MatTreeModule,
    ClipboardModule,
    // monaco
    MonacoEditorModule.forRoot(),
    // markdown
    MarkdownModule.forRoot(),
    // myrmidon
    NgToolsModule,
    NgMatToolsModule,
    AuthJwtLoginModule,
    AuthJwtAdminModule,
    NgxDirtyCheckModule,
    // cadmus bricks
    CadmusRefsAssertedIdsModule,
    CadmusRefsDocReferencesModule,
    CadmusRefsHistoricalDateModule,
    CadmusRefsLookupModule,
    CadmusCodLocationModule,
    CadmusCodicologyUiModule,
    CadmusPartCodicologySheetLabelsModule,
    CadmusRefsViafLookupModule,
    // cadmus
    CadmusBiblioUiModule,
    CadmusApiModule,
    CadmusCoreModule,
    CadmusProfileCoreModule,
    CadmusStateModule,
    CadmusUiModule,
    CadmusUiPgModule,
    CadmusTextBlockViewModule,
    CadmusPreviewUiModule,
    CadmusPreviewPgModule,
  ],
  providers: [
    EnvServiceProvider,
    // parts and fragments type IDs to editor group keys mappings
    // https://github.com/nrwl/nx/issues/208#issuecomment-384102058
    // inject like: @Inject('partEditorKeys') partEditorKeys: PartEditorKeys
    {
      provide: 'partEditorKeys',
      useValue: PART_EDITOR_KEYS,
    },
    // index lookup definitions
    {
      provide: 'indexLookupDefinitions',
      useValue: INDEX_LOOKUP_DEFINITIONS,
    },
    // item browsers IDs to editor keys mappings
    // inject like: @Inject('itemBrowserKeys') itemBrowserKeys: { [key: string]: string }
    {
      provide: 'itemBrowserKeys',
      useValue: ITEM_BROWSER_KEYS,
    },
    // HTTP interceptor
    // https://medium.com/@ryanchenkie_40935/angular-authentication-using-the-http-client-and-http-interceptors-2f9d1540eb8
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthJwtInterceptor,
      multi: true,
    },
    // ELF dev tools
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: initElfDevTools,
      deps: [Actions],
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

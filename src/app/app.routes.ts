import { Routes } from '@angular/router';

import {
  AuthJwtGuardService,
  AuthJwtAdminGuardService,
} from '@myrmidon/auth-jwt-login';
import { EditorGuardService } from '@myrmidon/cadmus-api';
import { PendingChangesGuard } from '@myrmidon/cadmus-core';

import { BiblioPageComponent } from './biblio-page/biblio-page.component';
import { HomeComponent } from './home/home.component';
import { LoginPageComponent } from './login-page/login-page.component';
import { ManageUsersPageComponent } from './manage-users-page/manage-users-page.component';
import { RegisterUserPageComponent } from './register-user-page/register-user-page.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  // auth
  { path: 'login', component: LoginPageComponent },
  {
    path: 'reset-password',
    component: ResetPasswordComponent,
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'register-user',
    component: RegisterUserPageComponent,
    canActivate: [AuthJwtAdminGuardService],
  },
  {
    path: 'manage-users',
    component: ManageUsersPageComponent,
    canActivate: [AuthJwtAdminGuardService],
  },
  // cadmus - items
  {
    path: 'items/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-editor').then(
        (module) => module.ItemEditorComponent
      ),
    canActivate: [AuthJwtGuardService],
    canDeactivate: [PendingChangesGuard],
  },
  {
    path: 'items',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-list').then(
        (module) => module.ItemListComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  {
    path: 'search',
    loadComponent: () =>
      import('@myrmidon/cadmus-item-search').then(
        (module) => module.ItemSearchComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - thesauri
  {
    path: 'thesauri/:id',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-editor').then(
        (module) => module.ThesaurusEditorFeatureComponent
      ),
    canActivate: [EditorGuardService],
  },
  {
    path: 'thesauri',
    loadComponent: () =>
      import('@myrmidon/cadmus-thesaurus-list').then(
        (module) => module.ThesaurusListComponent
      ),
    canActivate: [EditorGuardService],
  },
  // cadmus - flags
  {
    path: 'flags',
    loadComponent: () =>
      import('@myrmidon/cadmus-flags-pg').then(
        (module) => module.FlagsEditorFeatureComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - parts
  {
    path: 'items/:iid/general',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-general-pg').then(
        (module) => module.CadmusPartGeneralPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // itinera - parts
  {
    path: 'items/:iid/itinera',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-itinera-pg').then(
        (module) => module.CadmusPartItineraPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // codicology - parts
  {
    path: 'items/:iid/codicology',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-codicology-pg').then(
        (module) => module.CadmusPartCodicologyPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // geography
  {
    path: 'items/:iid/geography',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-geo-pg').then(
        (module) => module.CadmusPartGeoPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // biblio - parts
  {
    path: 'items/:iid/biblio',
    loadChildren: () =>
      import('@myrmidon/cadmus-part-biblio-pg').then(
        (module) => module.CadmusPartBiblioPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - graph
  {
    path: 'graph',
    loadComponent: () =>
      import('@myrmidon/cadmus-graph-pg-ex').then(
        (module) => module.GraphEditorExFeatureComponent
      ),
    canActivate: [AuthJwtGuardService],
  },
  // cadmus - preview
  {
    path: 'preview',
    loadChildren: () =>
      import('@myrmidon/cadmus-preview-pg').then(
        (module) => module.CadmusPreviewPgModule
      ),
    canActivate: [AuthJwtGuardService],
  },
  // itinera - biblio
  {
    path: 'biblio',
    component: BiblioPageComponent,
    canActivate: [EditorGuardService],
  },
  // fallback
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', component: HomeComponent },
];
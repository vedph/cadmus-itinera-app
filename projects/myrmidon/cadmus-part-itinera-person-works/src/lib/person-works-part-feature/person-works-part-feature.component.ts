import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { PersonWorksPartComponent } from '../person-works-part/person-works-part.component';

@Component({
    selector: 'cadmus-person-works-feature',
    templateUrl: './person-works-part-feature.component.html',
    styleUrls: ['./person-works-part-feature.component.css'],
    imports: [CurrentItemBarComponent, PersonWorksPartComponent],
})
export class PersonWorksPartFeatureComponent
  extends EditPartFeatureBase
  implements OnInit
{
  constructor(
    router: Router,
    route: ActivatedRoute,
    snackbar: MatSnackBar,
    itemService: ItemService,
    thesaurusService: ThesaurusService,
    editorService: PartEditorService
  ) {
    super(
      router,
      route,
      snackbar,
      itemService,
      thesaurusService,
      editorService
    );
  }

  protected override getReqThesauriIds(): string[] {
    return ['assertion-tags', 'doc-reference-types', 'doc-reference-tags'];
  }
}

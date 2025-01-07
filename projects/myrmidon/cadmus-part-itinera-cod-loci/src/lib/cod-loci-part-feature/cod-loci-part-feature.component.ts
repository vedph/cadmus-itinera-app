import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditPartFeatureBase, PartEditorService } from '@myrmidon/cadmus-state';
import { ItemService, ThesaurusService } from '@myrmidon/cadmus-api';
import { CurrentItemBarComponent } from '@myrmidon/cadmus-ui-pg';
import { CodLociPartComponent } from '../cod-loci-part/cod-loci-part.component';

@Component({
  selector: 'cadmus-cod-loci-part-feature',
  templateUrl: './cod-loci-part-feature.component.html',
  styleUrls: ['./cod-loci-part-feature.component.css'],
  imports: [CurrentItemBarComponent, CodLociPartComponent],
})
export class CodLociPartFeatureComponent
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
    return ['cod-loci', 'cod-image-types'];
  }
}

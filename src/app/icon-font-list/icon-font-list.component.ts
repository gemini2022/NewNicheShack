import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListComponent } from '../list/list.component';
import { IconFontListItemComponent } from '../icon-font-list-item/icon-font-list-item.component';
import { IconFontListItem } from '../icon-font-list-item';

@Component({
  selector: 'ns-icon-font-list',
  standalone: true,
  imports: [CommonModule, IconFontListItemComponent],
  templateUrl: './icon-font-list.component.html',
  styleUrls: ['./icon-font-list.component.scss']
})
export class IconFontListComponent extends ListComponent { 
  @Input() public override list: Array<IconFontListItem> = new Array<IconFontListItem>();
}
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItemBase } from '../list-item-base';
import { IconFontListItem } from '../icon-font-list-item';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ns-icon-font-list-item',
  templateUrl: './icon-font-list-item.component.html',
  styleUrls: ['./icon-font-list-item.component.scss']
})
export class IconFontListItemComponent extends ListItemBase<IconFontListItem> { }
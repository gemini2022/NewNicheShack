import { ListBase } from '../list-base';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconFontListItem } from '../icon-font-list-item';
import { IconFontListItemComponent } from '../icon-font-list-item/icon-font-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-icon-font-list',
  templateUrl: './icon-font-list.component.html',
  styleUrls: ['./icon-font-list.component.scss'],
  imports: [CommonModule, IconFontListItemComponent]
})
export class IconFontListComponent extends ListBase<IconFontListItem> { }
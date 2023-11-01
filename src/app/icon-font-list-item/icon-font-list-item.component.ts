import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItemComponent } from '../list-item/list-item.component';
import { IconFontListItem } from '../icon-font-list-item';

@Component({
  selector: 'ns-icon-font-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icon-font-list-item.component.html',
  styleUrls: ['./icon-font-list-item.component.scss']
})
export class IconFontListItemComponent extends ListItemComponent {
  @Input() public override listItem: IconFontListItem = new IconFontListItem('', '');
}
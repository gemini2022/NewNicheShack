import { ListItem } from '../list-item';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItemBase } from '../list-item-base';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ns-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent extends ListItemBase<ListItem> { }
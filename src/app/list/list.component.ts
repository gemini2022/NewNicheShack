import { ListItem } from '../list-item';
import { ListBase } from '../list-base';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItemComponent } from '../list-item/list-item.component';

@Component({
  standalone: true,
  selector: 'ns-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
  imports: [CommonModule, ListItemComponent]
})
export class ListComponent extends ListBase<ListItem> { }
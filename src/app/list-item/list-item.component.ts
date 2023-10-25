import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListItem } from '../list-item';
import { SecondarySelectionType } from '../enums';

@Component({
  selector: 'ns-list-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.scss']
})
export class ListItemComponent {
  // Public
  public hasPrimarySelection: boolean = false;
  public hasSecondarySelection: boolean = false;
  public hasPrimarySelectionBorderOnly: boolean = false;
  public SecondarySelectionType = SecondarySelectionType;
  public secondarySelectionType: SecondarySelectionType | undefined | null;

  // Input
  @Input() public listItem: ListItem = new ListItem('', '');

  // Output
  @Output() public onMouseDown: EventEmitter<ListItem> = new EventEmitter();

  // View Child
  @ViewChild('htmlElement') public htmlElement!: ElementRef<HTMLElement>;



  public onListItemDown(e: MouseEvent) {
    this.onMouseDown.emit(this.listItem);
  }



  public initialize(primarySelectedListItemIsBorderOnly?: boolean) {
    this.hasPrimarySelection = false;
    this.secondarySelectionType = null;
    if (!primarySelectedListItemIsBorderOnly) this.hasSecondarySelection = false;
  }
}
import { ExitEditType } from '../enums';
import { ListItem } from '../list-item';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { EditableListItemBase } from '../editable-list-item-base';
import { HierarchyArrowComponent } from '../hierarchy-arrow/hierarchy-arrow.component';

@Component({
  standalone: true,
  selector: 'ns-editable-hierarchy-list-item',
  imports: [CommonModule, HierarchyArrowComponent],
  templateUrl: './editable-hierarchy-list-item.component.html',
  styleUrls: ['./editable-hierarchy-list-item.component.scss']
})
export class EditableHierarchyListItemComponent extends EditableListItemBase<ListItem> {
  public isArrowEnabled: boolean = true;
  @Output() public arrowChangedEvent: EventEmitter<boolean> = new EventEmitter();
  @Output() public setHierarchyListItemsArrowEnableState: EventEmitter<boolean> = new EventEmitter();



  public override enterEditMode() {
    super.enterEditMode();
    this.setHierarchyListItemsArrowEnableState.emit(false);
  }



  public override exitEditMode(exitEditType?: ExitEditType) {
    super.exitEditMode(exitEditType);
    this.setHierarchyListItemsArrowEnableState.emit(true);
  }



  public override initialize(primarySelectedListItemIsBorderOnly?: boolean): void {
    super.initialize(primarySelectedListItemIsBorderOnly);
    this.isArrowEnabled = true;
  }
 }
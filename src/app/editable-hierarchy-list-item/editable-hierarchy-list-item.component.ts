import { ExitEditType } from '../enums';
import { CommonModule } from '@angular/common';
import { HierarchyListItem } from '../hierarchy-list-item';
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
export class EditableHierarchyListItemComponent extends EditableListItemBase<HierarchyListItem> {
  // Protected
  protected tierIndent!: number;

  // Public
  public isHidden: boolean = false;
  public isArrowDown: boolean = false;
  public isArrowEnabled: boolean = true;
  public isArrowFirstChange: boolean = true;

  // Outputs
  @Output() public setHierarchyListItemsArrowEnableState: EventEmitter<boolean> = new EventEmitter();
  @Output() public arrowChangedEvent: EventEmitter<EditableHierarchyListItemComponent> = new EventEmitter();


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
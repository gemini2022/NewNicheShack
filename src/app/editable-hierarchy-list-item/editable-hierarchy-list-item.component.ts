import { CaseType, ExitEditType } from '../enums';
import { CommonModule } from '@angular/common';
import { HierarchyItem } from '../hierarchy-item';
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
export class EditableHierarchyListItemComponent extends EditableListItemBase<HierarchyItem> {
  // Protected
  protected tierIndent!: number;

  // Public
  public isHidden: boolean = false;
  public isArrowDown: boolean = false;
  public isArrowEnabled: boolean = true;
  public isArrowFirstChange: boolean = true;

  // Outputs
  @Output() public setHierarchyItemsArrowEnableState: EventEmitter<boolean> = new EventEmitter();
  @Output() public arrowChangedEvent: EventEmitter<EditableHierarchyListItemComponent> = new EventEmitter();


  public override enterEditMode(caseType: CaseType, multiItemPasteable: boolean, duplicateItemVerify: boolean) {
    super.enterEditMode(caseType, multiItemPasteable, duplicateItemVerify);
    this.setHierarchyItemsArrowEnableState.emit(false);
  }



  public override exitEditMode(exitEditType?: ExitEditType) {
    super.exitEditMode(exitEditType);
    if(!this.inAlertMode) this.setHierarchyItemsArrowEnableState.emit(true);
  }



  public override initialize(primarySelectedItemIsBorderOnly?: boolean): void {
    super.initialize(primarySelectedItemIsBorderOnly);
    this.isArrowEnabled = true;
  }
}
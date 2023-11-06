import { ListItem } from '../list-item';
import { CommonModule } from '@angular/common';
import { EditableListBase } from '../editable-list-base';
import { Component, QueryList, ViewChildren } from '@angular/core';
import { EditableHierarchyListItemComponent } from '../editable-hierarchy-list-item/editable-hierarchy-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-editable-hierarchy-list',
  templateUrl: './editable-hierarchy-list.component.html',
  styleUrls: ['./editable-hierarchy-list.component.scss'],
  imports: [CommonModule, EditableHierarchyListItemComponent]
})
export class EditableHierarchyListComponent extends EditableListBase<ListItem> {
  @ViewChildren('listItemComponent') protected editableHierarchyListItemComponents: QueryList<EditableHierarchyListItemComponent> = new QueryList<EditableHierarchyListItemComponent>();


  protected onArrowChanged(isArrowDown: boolean) {
    console.log(isArrowDown)
  }

  protected setHierarchyListItemsArrowEnableState(isEnabled: boolean) {
    this.editableHierarchyListItemComponents.forEach(x => x.isArrowEnabled = isEnabled);
  }
}
import { Observable, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { EditableListBase } from '../editable-list-base';
import { HierarchyItem } from '../hierarchy-list-item';
import { Component, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { EditableHierarchyListItemComponent } from '../editable-hierarchy-list-item/editable-hierarchy-list-item.component';

@Component({
  standalone: true,
  selector: 'ns-editable-hierarchy-list',
  templateUrl: './editable-hierarchy-list.component.html',
  styleUrls: ['./editable-hierarchy-list.component.scss'],
  imports: [CommonModule, EditableHierarchyListItemComponent]
})
export class EditableHierarchyListComponent extends EditableListBase<HierarchyItem> {
  // Private
  private parentIndex!: number;
  private newItemAdded!: boolean;

  // Public
  public getChildItems!: (parentId: any) => Observable<Array<HierarchyItem>>;
  public postHierarchyItem!: (parentId: any, text: string) => Observable<any>;

  // Outputs
  @Output() public hierarchyCollapseStateUpdatedEvent: EventEmitter<boolean> = new EventEmitter();

  // View Children
  @ViewChildren('listItemComponent') protected editableHierarchyListItemComponents: QueryList<EditableHierarchyListItemComponent> = new QueryList<EditableHierarchyListItemComponent>();



  protected override loadItems(items: Array<HierarchyItem>) {
    items.map(x => x.tier = 0)
    this.list = items;
  }



  protected onArrowChange(parentHierarchyItem: EditableHierarchyListItemComponent) {
    this.parentIndex = this.list.indexOf(parentHierarchyItem.listItem);
    this.showHide(this.parentIndex);
    this.getHierarchyCollapseState();
    this.getChildren(parentHierarchyItem);
    this.selectParentOnCollapse(parentHierarchyItem);
  }



  private showHide(parentIndex: number) {
    if (parentIndex === -1) return;
    for (let i = parentIndex + 1; i < this.list.length; i++) {
      if (this.list[i].tier === this.list[parentIndex].tier + 1) {

        this.editableHierarchyListItemComponents.get(i)!.isHidden = !(this.editableHierarchyListItemComponents.get(parentIndex)!.isArrowDown && !this.editableHierarchyListItemComponents.get(parentIndex)!.isHidden);
        if (i + 1 < this.list.length && this.list[i + 1].tier > this.list[i].tier) this.showHide(i);

      } else if (this.list[i].tier <= this.list[parentIndex].tier) {
        break;
      }
    }
  }



  private getChildren(parentItem: EditableHierarchyListItemComponent) {
    if (parentItem.isArrowDown && parentItem.isArrowFirstChange) {
      parentItem.isArrowFirstChange = false;

      this.getChildItems(parentItem.listItem.id)
        .pipe(take(1))
        .subscribe((childItems: Array<HierarchyItem>) => {
          const startIndex = this.parentIndex + (this.newItemAdded ? 2 : 1);

          childItems.map(x => x.tier = parentItem.listItem.tier + 1);
          this.list.splice(startIndex, 0, ...childItems);

          if (this.newItemAdded) {
            setTimeout(() => {
              for (let i = startIndex; i < startIndex + childItems.length; i++) {
                this.editableHierarchyListItemComponents.get(i)!.isEnabled = false;
              }
            });
          }
          this.newItemAdded = false;
        });
    }
  }



  private selectParentOnCollapse(parentHierarchyItem: EditableHierarchyListItemComponent) {
    if (parentHierarchyItem.isArrowDown) return;

    const currentSelectedItem = this.editableHierarchyListItemComponents.find(x => x.hasPrimarySelection);
    if (!currentSelectedItem || currentSelectedItem === parentHierarchyItem) return;

    const indexOfParentHierarchyItem = this.list.indexOf(parentHierarchyItem.listItem);
    if (indexOfParentHierarchyItem === -1) return;

    for (let i = indexOfParentHierarchyItem + 1; i < this.list.length; i++) {
      if (this.list[i].tier <= parentHierarchyItem.listItem.tier) break;
      if (this.list[i].id == currentSelectedItem.listItem.id) {
        if (this.noSelectOnArrowKey) {
          parentHierarchyItem.hasPrimarySelectionBorderOnly = true;
          super.selectListItem(parentHierarchyItem.listItem);
        } else {
          currentSelectedItem.initialize();
          parentHierarchyItem.select();
        }
      }
    }
  }



  private getHierarchyCollapseState() {
    this.hierarchyCollapseStateUpdatedEvent.emit(!this.editableHierarchyListItemComponents.some(x => x.isArrowDown));
  }



  protected setHierarchyListItemsArrowEnableState(isEnabled: boolean) {
    this.editableHierarchyListItemComponents.forEach(x => x.isArrowEnabled = isEnabled);
  }



  public override selectListItem(listItem: HierarchyItem): void {
    const index = this.list.indexOf(listItem);

    if (!this.editableHierarchyListItemComponents.get(index)!.isHidden) {
      super.selectListItem(listItem);
      return;
    }
    this.selectNextVisibleItem(index);
  }



  private selectNextVisibleItem(indexOfNextSelectedItem: number) {
    const indexOfCurrentSelectedItem = this.editableHierarchyListItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
    if (indexOfCurrentSelectedItem === -1) return;
    const direction = indexOfNextSelectedItem - indexOfCurrentSelectedItem;

    for (let i = indexOfNextSelectedItem + direction; i >= 0 && i < this.list.length; i += direction) {
      const component = this.editableHierarchyListItemComponents.get(i);
      if (component && !component.isHidden) {
        super.selectListItem(component.listItem);
        break;
      }
    }
  }



  public collapseHierarchy() {
    this.editableHierarchyListItemComponents.forEach(x => {
      x.isArrowDown = false;
      x.arrowChangedEvent.emit(x);
    })
  }



  public override add(tier: number = 0, isParent: boolean = false): void {
    const selectedItemIndex = this.editableHierarchyListItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
    this.addEventListeners();
    this.initializeListItemsInList();
    this.stopMouseDownPropagation = false;

    if (tier === 0) {
      this.insertItem(0, tier, isParent);
    } else {
      if (selectedItemIndex === -1) return;
      const currentTier = this.list[selectedItemIndex].tier;
      const insertIndex = tier > currentTier ? selectedItemIndex + 1 : this.getParentIndex(this.list[selectedItemIndex]) + 1;
      this.insertItem(insertIndex, tier, isParent);

      if (!this.editableHierarchyListItemComponents.get(selectedItemIndex)!.isArrowDown && tier > currentTier) {
        this.newItemAdded = true;
        this.editableHierarchyListItemComponents.get(selectedItemIndex)!.isArrowDown = true;
        this.onArrowChange(this.editableHierarchyListItemComponents.get(selectedItemIndex)!);
      }
    }
  }



  private insertItem(index: number, tier: number, isParent: boolean): void {
    this.list.splice(index, 0, { id: '', text: '', tier, isParent } as HierarchyItem);
    setTimeout(() => this.editableHierarchyListItemComponents.get(index)!.identify(this.caseType));
  }



  protected override onItemAdded(text: string) {
    const newItemIndex = this.editableHierarchyListItemComponents.toArray().findIndex(itemComponent => itemComponent.isNew);
    if (newItemIndex === -1) return;
    const parentIndex = this.getParentIndex(this.list[newItemIndex]);
    const parentId = parentIndex ? this.list[parentIndex].id : null;

    this.postHierarchyItem(parentId, text)
      .pipe(take(1))
      .subscribe((id: any) => {
        this.loading = false;
        const newItem = { id: id, text: text, tier: this.list[newItemIndex].tier, isParent: this.list[newItemIndex].isParent } as HierarchyItem;
        this.list.splice(newItemIndex, 1, newItem);
        this.sort(newItem);

        setTimeout(() => {
          const newItemComponent = this.editableHierarchyListItemComponents.find(itemComponent => itemComponent.listItem === newItem);
          if (newItemComponent) newItemComponent.select();
        });
      })
  }



  protected override sort(hierarchyItem: HierarchyItem) {
    let parentHierarchyIndex: number = -1;
    let tempArray: Array<HierarchyItem> = [];

    if (hierarchyItem.tier === 0) {
      tempArray = this.list.filter(item => item.tier === 0);
    } else {
      parentHierarchyIndex = this.getParentIndex(hierarchyItem);
      for (let i = parentHierarchyIndex + 1; i < this.list.length; i++) {
        if (this.list[i].tier == this.list[parentHierarchyIndex].tier) break;
        if (this.list[i].tier == this.list[parentHierarchyIndex].tier + 1) {
          tempArray.push(this.list[i] as HierarchyItem)
        }
      }
    }
    tempArray.sort((a, b) => a.text.localeCompare(b.text));

    let newHierarchyGroup: Array<HierarchyItem> = [];
    tempArray.forEach(x => {
      let index = this.list.findIndex(y => y.id === x.id);

      for (let i = index; i < this.list.length; i++) {
        if (i != index && this.list[i].tier <= this.list[index].tier) break;
        newHierarchyGroup.push(this.list[i] as HierarchyItem);
      }
    })
    this.list.splice(parentHierarchyIndex + 1, newHierarchyGroup.length, ...newHierarchyGroup);
  }



  getParentIndex(item: HierarchyItem): number {
    let parentIndex!: number;
    const itemIndex = this.list.indexOf(item);

    for (let i = itemIndex; i >= 0; i--) {
      if (this.list[i].tier < this.list[itemIndex].tier) {
        parentIndex = i;
        break;
      }
    }
    return parentIndex;
  }
}
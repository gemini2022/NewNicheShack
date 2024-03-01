import { Observable, take } from 'rxjs';
import { CommonModule } from '@angular/common';
import { EditableListBase } from '../editable-list-base';
import { HierarchyItem } from '../hierarchy-item';
import { Component, EventEmitter, Output, QueryList, ViewChildren } from '@angular/core';
import { EditableHierarchyListItemComponent } from '../editable-hierarchy-list-item/editable-hierarchy-list-item.component';
import { HierarchyItemSettings } from '../hierarchy-item-settings';
import { AlertType } from '../enums';
import { TierOptions } from '../tier-options';

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
  public tier: Array<TierOptions> = new Array<TierOptions>();
  public getChildItems!: (parentId: any) => Observable<Array<HierarchyItem>>;
  public postHierarchyItem!: (parentId: any, text: string) => Observable<any>;

  // Outputs
  @Output() public hierarchyCollapseStateUpdatedEvent: EventEmitter<boolean> = new EventEmitter();

  // View Children
  @ViewChildren('listItemComponent') protected editableHierarchyItemComponents: QueryList<EditableHierarchyListItemComponent> = new QueryList<EditableHierarchyListItemComponent>();



  protected override loadItems(items: Array<HierarchyItem>) {
    items.map(x => x.tier = 0)
    this.items = items;
  }



  protected onArrowChange(parentHierarchyItem: EditableHierarchyListItemComponent) {
    this.parentIndex = this.items.indexOf(parentHierarchyItem.item);
    this.showHide(this.parentIndex);
    this.getHierarchyCollapseState();
    this.getChildren(parentHierarchyItem);
    this.selectParentOnCollapse(parentHierarchyItem);
  }



  private showHide(parentIndex: number) {
    if (parentIndex === -1) return;
    for (let i = parentIndex + 1; i < this.items.length; i++) {
      if (this.items[i].tier === this.items[parentIndex].tier + 1) {

        this.editableHierarchyItemComponents.get(i)!.isHidden = !(this.editableHierarchyItemComponents.get(parentIndex)!.isArrowDown && !this.editableHierarchyItemComponents.get(parentIndex)!.isHidden);
        if (i + 1 < this.items.length && this.items[i + 1].tier > this.items[i].tier) this.showHide(i);

      } else if (this.items[i].tier <= this.items[parentIndex].tier) {
        break;
      }
    }
  }



  private getChildren(parentItem: EditableHierarchyListItemComponent) {
    if (parentItem.isArrowDown && parentItem.isArrowFirstChange) {
      parentItem.isArrowFirstChange = false;

      this.getChildItems(parentItem.item.id)
        .pipe(take(1))
        .subscribe((childItems: Array<HierarchyItem>) => {
          const startIndex = this.parentIndex + (this.newItemAdded ? 2 : 1);

          childItems.map(x => x.tier = parentItem.item.tier + 1);
          this.items.splice(startIndex, 0, ...childItems);

          if (this.newItemAdded) {
            setTimeout(() => {
              for (let i = startIndex; i < startIndex + childItems.length; i++) {
                this.editableHierarchyItemComponents.get(i)!.isEnabled = false;
              }
            });
          }
          this.newItemAdded = false;
        });
    }
  }



  private selectParentOnCollapse(parentHierarchyItem: EditableHierarchyListItemComponent) {
    if (parentHierarchyItem.isArrowDown) return;

    const currentSelectedItem = this.editableHierarchyItemComponents.find(x => x.hasPrimarySelection);
    if (!currentSelectedItem || currentSelectedItem === parentHierarchyItem) return;

    const indexOfParentHierarchyItem = this.items.indexOf(parentHierarchyItem.item);
    if (indexOfParentHierarchyItem === -1) return;

    for (let i = indexOfParentHierarchyItem + 1; i < this.items.length; i++) {
      if (this.items[i].tier <= parentHierarchyItem.item.tier) break;
      if (this.items[i].id == currentSelectedItem.item.id) {
        if (this.noSelectOnArrowKey) {
          parentHierarchyItem.hasPrimarySelectionBorderOnly = true;
          super.selectItem(parentHierarchyItem.item);
        } else {
          currentSelectedItem.initialize();
          parentHierarchyItem.select();
        }
      }
    }
  }



  private getHierarchyCollapseState() {
    this.hierarchyCollapseStateUpdatedEvent.emit(!this.editableHierarchyItemComponents.some(x => x.isArrowDown));
  }



  protected setHierarchyItemsArrowEnableState(isEnabled: boolean) {
    this.editableHierarchyItemComponents.forEach(x => x.isArrowEnabled = isEnabled);
  }



  public override selectItem(item: HierarchyItem): void {
    const index = this.items.indexOf(item);

    if (!this.editableHierarchyItemComponents.get(index)!.isHidden) {
      super.selectItem(item);
      return;
    }
    this.selectNextVisibleItem(index);
  }



  private selectNextVisibleItem(indexOfNextSelectedItem: number) {
    const indexOfCurrentSelectedItem = this.editableHierarchyItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
    if (indexOfCurrentSelectedItem === -1) return;
    const direction = indexOfNextSelectedItem - indexOfCurrentSelectedItem;

    for (let i = indexOfNextSelectedItem + direction; i >= 0 && i < this.items.length; i += direction) {
      const component = this.editableHierarchyItemComponents.get(i);
      if (component && !component.isHidden) {
        super.selectItem(component.item);
        break;
      }
    }
  }



  public collapseHierarchy() {
    this.editableHierarchyItemComponents.forEach(x => {
      x.isArrowDown = false;
      x.arrowChangedEvent.emit(x);
    })
  }



  public override add(itemSettings = new HierarchyItemSettings()): void {
    const selectedItemIndex = this.editableHierarchyItemComponents.toArray().findIndex(x => x.hasPrimarySelection);
    this.addEventListeners();
    this.initializeItems();
    this.stopMouseDownPropagation = false;

    if (itemSettings.tier === 0) {
      this.updateTierOptions(0);
      this.items.splice(0, 0, new HierarchyItem('', '', itemSettings.tier!, itemSettings.isParent!));
      setTimeout(() => this.editableHierarchyItemComponents.get(0)!.identify(this.caseType, this.multiItemPasteable, this.duplicateItemVerify));

    } else {
      if (selectedItemIndex === -1) return;
      this.updateTierOptions(itemSettings.tier!);
      const insertIndex = itemSettings.tier! > this.items[selectedItemIndex].tier ? selectedItemIndex + 1 : this.getParentIndex(this.items[selectedItemIndex]) + 1;
      this.items.splice(insertIndex, 0, new HierarchyItem('', '', itemSettings.tier!, itemSettings.isParent!));

      setTimeout(() => {
        this.editableHierarchyItemComponents.get(insertIndex)!.identify(this.caseType, this.multiItemPasteable, this.duplicateItemVerify)

        if (!this.editableHierarchyItemComponents.get(selectedItemIndex)!.isArrowDown && itemSettings.tier! > this.items[selectedItemIndex].tier) {
          this.newItemAdded = true;
          this.editableHierarchyItemComponents.get(selectedItemIndex)!.isArrowDown = true;
          this.onArrowChange(this.editableHierarchyItemComponents.get(selectedItemIndex)!);
        }
      });
    }
  }



  protected override onItemAdded(text: string) {
    const newItemIndex = this.editableHierarchyItemComponents.toArray().findIndex(itemComponent => itemComponent.isNew);
    if (newItemIndex === -1) return;
    const parentIndex = this.getParentIndex(this.items[newItemIndex]);
    const parentId = parentIndex !== -1 ? this.items[parentIndex].id : null;

    this.postHierarchyItem(parentId, text)
      .pipe(take(1))
      .subscribe((id: any) => {
        this.loading = false;
        const newItem = { id: id, text: text, tier: this.items[newItemIndex].tier, isParent: this.items[newItemIndex].isParent } as HierarchyItem;
        this.items.splice(newItemIndex, 1, newItem);
        this.sort(newItem);

        setTimeout(() => {
          const newItemComponent = this.editableHierarchyItemComponents.find(itemComponent => itemComponent.item === newItem);
          if (newItemComponent) newItemComponent.select();
        });
      })
  }



  public override edit(): void {
    const editedItem = this.editableHierarchyItemComponents.find(x => x.hasPrimarySelection);
    if (!editedItem) return;
    this.updateTierOptions(editedItem.item.tier);
    editedItem.enterEditMode(this.caseType, this.multiItemPasteable, this.duplicateItemVerify);
  }



  private updateTierOptions(tier: number) {
    this.caseType = this.tier[tier]?.caseType ?? this.caseType;
    this.multiItemPasteable = this.tier[tier]?.multiItemPasteable ?? this.multiItemPasteable;
    this.duplicateItemVerify = this.tier[tier]?.duplicateItemVerify ?? this.duplicateItemVerify;
  }



  protected override sort(hierarchyItem: HierarchyItem) {
    let parentHierarchyIndex: number = -1;
    let tempArray: Array<HierarchyItem> = [];

    if (hierarchyItem.tier === 0) {
      tempArray = this.items.filter(item => item.tier === 0);
    } else {
      parentHierarchyIndex = this.getParentIndex(hierarchyItem);
      tempArray = this.getTierGroup(hierarchyItem);
    }
    tempArray.sort((a, b) => a.text.localeCompare(b.text));

    let newHierarchyGroup: Array<HierarchyItem> = [];
    tempArray.forEach(x => {
      let index = this.items.findIndex(y => y.id === x.id);

      for (let i = index; i < this.items.length; i++) {
        if (i != index && this.items[i].tier <= this.items[index].tier) break;
        newHierarchyGroup.push(this.items[i] as HierarchyItem);
      }
    })
    this.items.splice(parentHierarchyIndex + 1, newHierarchyGroup.length, ...newHierarchyGroup);
  }



  getParentIndex(item: HierarchyItem): number {
    let parentIndex: number = -1;
    const itemIndex = this.items.indexOf(item);

    for (let i = itemIndex; i >= 0; i--) {
      if (this.items[i].tier < this.items[itemIndex].tier) {
        parentIndex = i;
        break;
      }
    }
    return parentIndex;
  }



  protected override getIdsOfItemsToDelete(): Array<any> {
    let ids: Array<any> = new Array<any>();

    this.editableHierarchyItemComponents.filter(x => x.hasSecondarySelection).forEach(x => {
      const startingIndex = this.items.indexOf(x.item);

      for (let i = startingIndex; i < this.items.length; i++) {
        if (i != startingIndex && this.items[i].tier <= x.item.tier) break;

        if (ids.indexOf(this.items[i].id) == -1) {
          ids.push(this.items[i].id);
        }
      }
    });
    return ids;
  }



  protected override selectNextItemAfterDelete(): void {
    const indexOfFirstSelectedItem = this.editableHierarchyItemComponents.toArray().findIndex(x => x.hasSecondarySelection);
    const firstSelectedItem = this.editableHierarchyItemComponents.get(indexOfFirstSelectedItem);
    if (!firstSelectedItem) return;

    const findNextItem = (direction: number): EditableHierarchyListItemComponent | undefined => {
      for (let i = indexOfFirstSelectedItem + direction; i >= 0 && i < this.items.length; i += direction) {
        if (this.items[i].tier < firstSelectedItem.item.tier) break;
        const itemcomponent = this.editableHierarchyItemComponents.get(i);
        if (itemcomponent && this.items[i].tier === firstSelectedItem.item.tier && !itemcomponent.hasSecondarySelection) {
          return itemcomponent;
        }
      }
      return undefined;
    };

    let nextItem = findNextItem(1) || findNextItem(-1) || this.editableHierarchyItemComponents.get(this.getParentIndex(firstSelectedItem.item));
    if (!nextItem) return;

    if (this.noSelectOnArrowKey) {
      nextItem.hasPrimarySelectionBorderOnly = true;
      this.selectItem(nextItem.item as HierarchyItem);
    } else {
      nextItem.select();
    }
  }



  protected override onInput(text: string): void {
    if (this.duplicateItemVerify) {
      const editedItemComponent = this.editableHierarchyItemComponents.find(itemComponent => itemComponent.inEditMode);
      if (editedItemComponent) {

        if (this.getTierGroup(editedItemComponent.item).some(item => item.text.toLowerCase() === text.toLowerCase() && item !== editedItemComponent.item)) {
          editedItemComponent.inAlertMode = true;
          this.inputAlertEvent.emit(AlertType.Duplicate);
        } else {
          editedItemComponent.inAlertMode = false;
          this.inputAlertEvent.emit(AlertType.None);
        }
      }
    }
  }



  getTierGroup(item: HierarchyItem): Array<HierarchyItem> {
    let tierGroup = [];
    const editedItemParentIndex = this.getParentIndex(item);

    if (editedItemParentIndex !== -1) {
      for (let i = editedItemParentIndex + 1; i < this.items.length; i++) {
        if (this.items[i].tier <= this.items[editedItemParentIndex].tier) break;
        if (this.items[i].tier === this.items[editedItemParentIndex].tier + 1) {
          tierGroup.push(this.items[i])
        }
      }
    } else {
      tierGroup = this.items.filter(x => x.tier == 0)
    }
    return tierGroup;
  }
}
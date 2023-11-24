import { ListItem } from "./list-item";

export class HierarchyItem extends ListItem {
    public tier: number = 0;
    public isParent!: boolean;
}
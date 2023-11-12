import { ListItem } from "./list-item";

export class HierarchyListItem extends ListItem {
    public tier!: number;
    public isParent!: boolean;
}
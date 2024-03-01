import { ListItem } from "./list-item";

export class HierarchyItem extends ListItem {
    constructor(id: any, text: string, public tier: number, public isParent: boolean) {
        super(id, text);
    }
}
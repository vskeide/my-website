declare module "jsonstat-toolkit" {
    interface JStatCategory {
        label: string;
        id: string;
    }
    interface JStatDimension {
        id: string[];
        length: number;
        label: string;
        Category(selector: string | number): JStatCategory;
    }
    interface JStatItem {
        value: number | null;
        status: string | null;
    }
    interface JStatDataset {
        id: string[];
        value: (number | null)[];
        label: string;
        Dimension(selector: string | number): JStatDimension;
        Data(selector: Record<string, string>): JStatItem | null;
    }
    interface JStatResult {
        class: string;
        Dataset(id: number): JStatDataset;
        Dimension(selector: string | number): JStatDimension;
        value: (number | null)[];
    }
    function JSONstat(data: unknown): JStatResult;
    export default JSONstat;
}

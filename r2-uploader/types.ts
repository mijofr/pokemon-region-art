import { HasInfo } from "./lib/tree-node"

export interface MetricsResponse {
    data:   DataResp;
    errors: null;
}

export interface DataResp {
    viewer: ViewerResp;
}

export interface ViewerResp {
    accounts: AccountResp[];
}

export interface AccountResp {
    r2OperationsAdaptiveGroups: R2OperationsAdaptiveGroup[];
}

export interface R2OperationsAdaptiveGroup {
    dimensions: DimensionsResp;
    sum:        SumResp;
}

export interface DimensionsResp {
    actionType:   string;
    storageClass: string;
}

export interface SumResp {
    requests: number;
}



// filetree: TreeNode<ImgInfo, DirInfo>


export interface ImgInfo extends HasInfo {
    name: string;
    enumeratedName: string;
    path: string;
    extension: string;
    relPath: string;
    width: number;
    height: number;
    lossless: boolean;
    thumbPath: string;
    filesize: number;
    quality: number;
    aspect: number;
    hash: string;
}


export interface DirInfo {
    fullPath: string;
    uniqueIdString: string;
    depth: number;
    isMinor: boolean;
    note?: string;
}

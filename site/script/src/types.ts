import { HasInfo } from "lib/tree-node";

export interface DEnt {
    name: string;
    isFile: boolean;
    isDirectory: boolean;
}


export interface Size2 {
    w: number;
    h: number;
}

export interface FileSizeDesc {
    size: number;
    unit: string;
}

export interface IFSWrap {
    readDirectory(fpath: string): Promise<DEnt[]>;
    readFile(fpath): Promise<string>;
    writeFile(fpath: string, content: string): Promise<void>;
    existsDir(folderPath): Promise<boolean>;
    ensureDir(folderPath): Promise<void>;
    emptyDir(folderPath): Promise<void>;
    pathJoin(...paths: string[]): string;
    pathRelative(from: string, to: string): string;
    pathBasename(p: string, ext?: string): string;
    getFilesize(fpath: string): Promise<number>;
    readonly pathSep: string;
}

 
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
}


export interface DirInfo {
    fullPath: string;
    uniqueIdString: string;
    depth: number;
    isMinor: boolean;
    note?: string;
}

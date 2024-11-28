
export interface DEnt {
    name: string;
    isFile: boolean;
    isDirectory: boolean;
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
    readonly pathSep: string;
}

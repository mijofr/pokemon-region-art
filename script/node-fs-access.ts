import * as fs from "fs-extra";
import path from "path";

import { IFSWrap, DEnt } from "./types";

export class NodeFsAccess implements IFSWrap {

    public async readDirectory(folderPath: string): Promise<DEnt[]> {

        return (await fs.readdir(path.resolve(folderPath), { withFileTypes: true }))
            .map(item => ({
                isFile: item.isFile(),
                isDirectory: item.isDirectory(),
                name: item.name
            }));
    }

    public async readFile(folderPath): Promise<string> {
        return (await fs.readFile(path.resolve(folderPath))).toString();
    }

    public async writeFile(folderPath: string, content: string): Promise<void> {
        await fs.writeFile(path.resolve(folderPath), content);
    }

    public async existsDir(folderPath): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            fs.access(path.resolve(folderPath), fs.constants.R_OK, (err) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        });
    }

    public async ensureDir(folderPath): Promise<void> {
        return await fs.ensureDir(path.resolve(folderPath));
    }

    public async emptyDir(folderPath): Promise<void> {
        return await fs.emptyDir(path.resolve(folderPath));
    }

    public pathJoin(...paths: string[]): string {
        return path.join(...paths);
    }

    public pathRelative(from: string, to: string): string {
        return path.relative(from, to);
    }

    public pathBasename(p: string, ext?: string): string {
        if (ext) {
            return path.basename(p, ext);
        } else {
            return path.basename(p);
        }
    }

    get pathSep(): string {
        return path.sep;
    }

    

}


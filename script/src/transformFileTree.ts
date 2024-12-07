import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";

export interface Grouping {
    name: string;
    depth: number;
    uniqueId: string;

    childGroups: Grouping[];
    imgs: ImgSet[];
    
}

export interface ImgSet { 
    name: string;
    enumeratedName: string;
    path: string;
    files: ImgFile[];
    maxMegapixels: string;
    singular: boolean;
}

export interface ImgFile {
    fileName: string;
    filePath: string;
    extension: string;
    width: number;
    height: number;
    filesize: number;
    megapixels: number;
    lossless: boolean;

}


function transformTree(dataset: TreeNode<ImgInfo, DirInfo>) {

}

async function main() {
    let dataset: TreeNode<ImgInfo, DirInfo> = 
        JSON.parse((await fsAccess.readFile("./../fileTree.json")).toString());

    let outputTree = transformTree(dataset);

    console.log(JSON.stringify(outputTree, null, "\t"));

    fsAccess.writeFile("./../imageDisplayTree.json", JSON.stringify(outputTree, null, "\t"));


}

main();
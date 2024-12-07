import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";

export interface Grouping {
    name: string;
    depth: number;
    uniqueId: string;
    notes: string;

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
    notes: string;
    isMinor: boolean;
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


function transformSingularImage(img: ImgInfo) {

}

function transformImgGroupImg(img: ImgInfo) {


    return {
        files: [{
            
        }]
    }
}
function transformImgGroup(dataset: TreeNode<ImgInfo, DirInfo>) {

    for (let i of dataset.items) {
        transformImgGroupImg(i);
    }
    if (dataset.children.length > 0) {
        console.warn("Extra children of " + dataset.path.toString());
    }
    
}


function transformTree(dataset: TreeNode<ImgInfo, DirInfo>) {

    for (let i of dataset.items) {
        transformSingularImage(i);
    }

    for (let c of dataset.children) {
        if (c.name.startsWith("_")) {
            transformImgGroup(c);
        } else {
            transformTree(c);
        }
    }


}

async function main() {
    let dataset: TreeNode<ImgInfo, DirInfo> = 
        JSON.parse((await fsAccess.readFile("./../fileTree.json")).toString());

    let outputTree = transformTree(dataset);

    console.log(JSON.stringify(outputTree, null, "\t"));

    fsAccess.writeFile("./../imageDisplayTree.json", JSON.stringify(outputTree, null, "\t"));


}

main();
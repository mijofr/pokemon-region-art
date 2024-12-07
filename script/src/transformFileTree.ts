import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";

export interface Grouping {
    name: string;
    depth: number;
    uniqueId: string;
    notes: string;
    isMinor: boolean;

    childGroups: Grouping[];
    imgs: ImgSet[];
    
}

export interface ImgSet { 
    name: string;
    enumeratedName: string;
    path: string;
    maxMegapixels: number;
    singular: boolean;
    notes: string;
    isMinor: boolean;

    files: ImgFile[];
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


function transformSingularImage(img: ImgInfo): ImgSet {

    return {
        name: img.name,
        enumeratedName: "",
        path: img.path,
        maxMegapixels: img.width * img.height,
        singular: true,
        notes: "",
        isMinor: false,
        files: [{
            fileName: img.name,
            filePath: img.relPath,
            extension: img.extension,
            width: img.width,
            height: img.height,
            filesize: img.filesize,
            megapixels: img.width * img.height,
            lossless: img.lossless
        
        }]
    }

}

function transformImgSet(dataset: TreeNode<ImgInfo, DirInfo>): ImgSet {


    let files: ImgFile[] = [];
    for (let i of dataset.items) {
        files.push(transformImgSetImg(i));
    }
    if (dataset.children.length > 0) {
        console.warn("Extra children of " + dataset.path.toString());
    }

    let maxMegapixels = Math.max(...files.map(n => n.megapixels));

    return {
        name: dataset.name,
        enumeratedName: "",
        path: dataset.metadata.fullPath,
        maxMegapixels: maxMegapixels,
        singular: (dataset.items.length <= 1),
        notes: "",
        isMinor: false,
        files: files
    }
}
function transformImgSetImg(img: ImgInfo): ImgFile {
    return {
        fileName: img.name,
        filePath: img.relPath,
        extension: img.extension,
        width: img.width,
        height: img.height,
        filesize: img.filesize,
        megapixels: img.width * img.height,
        lossless: img.lossless
    }
}

function sortGroups(groups: Grouping[]) {

}


function transformTree(data: TreeNode<ImgInfo, DirInfo>): Grouping {


    let childGroups: Grouping[] = [];
    let imgs: ImgSet[] = [];

    for (let i of data.items) {
        transformSingularImage(i);
    }

    for (let c of data.children) {
        if (c.name.startsWith("_")) {
            transformImgSet(c);
        } else {
            childGroups.push(transformTree(c));
        }
    }

    sortGroups(childGroups);

    return {    
        name: data.name,
        depth: data.metadata.depth,
        uniqueId: data.metadata.uniqueIdString,
        notes: "",
        childGroups: childGroups,
        imgs: imgs,
        isMinor: false
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
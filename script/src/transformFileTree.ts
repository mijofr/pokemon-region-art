import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";
import path from "path";


let existingUniqueIds: Set<string> = new Set<string>;
function ensureUniqueId(inp: string): string {

    let checkInp = inp.toLocaleLowerCase();


    if (!existingUniqueIds.has(checkInp)) {
        existingUniqueIds.add(checkInp);
        return inp;
    }

    return inp;
}


export interface Grouping {
    _: "GROUPING";
    name: string;
    depth: number;
    uniqueId: string;
    notes: string;
    isMinor: boolean;

    path: string[];

    childGroups: Grouping[];
    imgs: ImgSet[];
    
}

export interface ImgSet { 
    _: "ImgSET";
    name: string;
    enumeratedName: string;
    maxMegapixels: number;
    singular: boolean;
    notes: string;
    isMinor: boolean;

    files: ImgFile[];

    thumbnailSrcPath: string;
    thumbnailPath: string;
}

export interface ImgFile {
    _: "ImgFILE";
    fileName: string;
    filePath: string;
    extension: string;
    width: number;
    height: number;
    filesize: number;
    megapixels: number;
    lossless: boolean;

}

function filePathRelative(pth: string): string {
    return "";
}


function transformSingularImage(img: ImgInfo): ImgSet {

    return {
        _: "ImgSET",
        name: img.name,
        enumeratedName: "",
        maxMegapixels: (img.width * img.height) / 1000000,
        singular: true,
        notes: "",
        isMinor: false,
        thumbnailSrcPath: "",
        thumbnailPath: "",
        files: [{
            _: "ImgFILE",
            fileName: img.name,
            filePath: img.relPath,
            extension: img.extension,
            width: img.width,
            height: img.height,
            filesize: img.filesize,
            megapixels: (img.width * img.height) / 1000000,
            lossless: img.lossless
        
        }]
    }

}

function transformImgSet(dataset: TreeNode<ImgInfo, DirInfo>): ImgSet {


    let name = dataset.name;
    if (dataset.name.startsWith("_")) {
        name = name.substring(1);
    }


    let files: ImgFile[] = [];
    for (let i of dataset.items) {
        files.push(transformImgSetImg(i));
    }
    if (dataset.children.length > 0) {
        console.warn("Extra children of " + dataset.path.toString());
    }

    let maxMegapixels = Math.max(...files.map(n => n.megapixels));

    return {
        _: "ImgSET",
        name: name,
        enumeratedName: "",
        maxMegapixels: maxMegapixels,
        singular: (dataset.items.length <= 1),
        notes: "",
        isMinor: false,
        thumbnailSrcPath: "",
        thumbnailPath: "",
        files: files
    }
}
function transformImgSetImg(img: ImgInfo): ImgFile {
    return {
        _: "ImgFILE",
        fileName: img.name,
        filePath: img.relPath,
        extension: img.extension,
        width: img.width,
        height: img.height,
        filesize: img.filesize,
        megapixels: (img.width * img.height) / 1000000,
        lossless: img.lossless
    }
}

function sortGroups(groups: Grouping[]) {

}


function transformTree(data: TreeNode<ImgInfo, DirInfo>): Grouping {


    let childGroups: Grouping[] = [];
    let imgs: ImgSet[] = [];

    for (let i of data.items) {
        imgs.push(transformSingularImage(i));
    }

    for (let c of data.children) {
        if (c.name.startsWith("_")) {
            imgs.push(transformImgSet(c));
        } else {
            childGroups.push(transformTree(c));
        }
    }

    sortGroups(childGroups);

    return {
        _: "GROUPING",
        name: data.name,
        depth: data.metadata.depth,
        path: data.path,
        uniqueId: data.metadata.uniqueIdString,
        notes: "",
        isMinor: false,
        imgs: imgs,
        childGroups: childGroups
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
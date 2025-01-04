import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";
import path from "path";
import { XmlNd } from "lib/xml-nd";
import { IsNullOrWhitespace } from "notes/util_set";


let existingUniqueIds: Set<string> = new Set<string>;
function ensureUniqueId(inp: string): string {

    let checkInp = inp.toLocaleLowerCase();


    if (!existingUniqueIds.has(checkInp)) {
        existingUniqueIds.add(checkInp);
        return inp;
    }

    return inp;
}

export interface Size2P extends Size2 {
    w: number;
    h: number;
    megapixels: number;
}


export interface Grouping {
    _: "GROUPING";
    name: string;
    depth: number;
    id: string;
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
    id: string;
    maxMegapixels: number;
    singular: boolean;
    notes: string;
    isMinor: boolean;
    sizes: Size2P[];

    files: ImgFile[];

    thumbnailSrcPath: string;
    thumbnailPath: string;
}

export interface ImgFile {
    _: "ImgFILE";
    id: string;
    fileName: string;
    filePath: string;
    extension: string;
    width: number;
    height: number;
    filesize: number;
    megapixels: number;
    lossless: boolean;
    aspect: number;

}

function filePathRelative(pth: string): string {
    return "";
}


function transformSingularImage(img: ImgInfo, pth: string[]): ImgSet {

    let enumeratedName = pth.concat([img.name]).join("\\");

    return {
        _: "ImgSET",
        name: img.name,
        id: `SET_${getUniqueId()}`,
        enumeratedName: enumeratedName,
        maxMegapixels: (img.width * img.height) / 1000000,
        singular: true,
        notes: "",
        sizes: [{w: img.width, h: img.height, 
            megapixels: (img.width * img.height) / 1000000}],
        isMinor: false,
        thumbnailSrcPath: path.join("regions", img.relPath),
        thumbnailPath: path.join("thumbs", enumeratedName + ".webp"),
        files: [{
            _: "ImgFILE",
            id: `IMG_${getUniqueId()}`,
            fileName: img.name,
            filePath: img.relPath,
            extension: img.extension,
            width: img.width,
            height: img.height,
            filesize: img.filesize,
            megapixels: (img.width * img.height) / 1000000,
            lossless: img.lossless,
            aspect: img.aspect
        
        }]
    }

}

function getThumbnailSrcPath(files: ImgFile[], maxMegapixels: number): string {
    let item = files.find(n => n.megapixels == maxMegapixels);
    if (!item) {
        return files[0].filePath;
    }
    let nList = files.filter(n => n.aspect == item.aspect).sort((a,b) => {
        if (b.megapixels == a.megapixels) {
            return a.filesize - b.filesize;
        }
        return a.megapixels - b.megapixels;
    })
    return nList[0].filePath;

}

function getSizes(files: ImgFile[]): Size2P[] {
    let f = files.map(f => `${f.width.toString()}x${f.height.toString()}`);
    let uniques = new Set(f);

    let sizes: Size2P[] = (Array.from(uniques)).map(n => {
        let spl = n.split("x");

        let w = parseInt(spl[0]);
        let h = parseInt(spl[1]);
        return {
             w, 
             h, 
             megapixels: (w * h) / 1000000
        };
    })
    .sort((a,b) => (b.megapixels - a.megapixels));
    return sizes;

}

function transformImgSet(dataset: TreeNode<ImgInfo, DirInfo>, pth: string[]): ImgSet {


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

    let enumeratedName = pth.concat([name]).join("\\");

    let thumbSrcPath = getThumbnailSrcPath(files, maxMegapixels);


    

    return {
        _: "ImgSET",
        name: name,
        id: `SET_${getUniqueId()}`,
        enumeratedName: enumeratedName,
        sizes: getSizes(files),
        maxMegapixels: maxMegapixels,
        singular: (dataset.items.length <= 1),
        notes: dataset.metadata.note ?? "",
        isMinor: false,
        thumbnailSrcPath: path.join("regions", thumbSrcPath),
        thumbnailPath: path.join("thumbs", enumeratedName + ".webp"),
        files: files
    }
}
function transformImgSetImg(img: ImgInfo): ImgFile {
    return {
        _: "ImgFILE",
        fileName: img.name,
        id: `IMG_${getUniqueId()}`,
        filePath: img.relPath,
        extension: img.extension,
        width: img.width,
        height: img.height,
        filesize: img.filesize,
        megapixels: (img.width * img.height) / 1000000,
        lossless: img.lossless,
        aspect: img.aspect
    }
}

function sortGroups(groups: Grouping[]) {

}


function transformTree(data: TreeNode<ImgInfo, DirInfo>): Grouping {


    let childGroups: Grouping[] = [];
    let imgs: ImgSet[] = [];

    for (let i of data.items) {
        imgs.push(transformSingularImage(i, data.path));
    }

    for (let c of data.children) {
        if (c.name.startsWith("_")) {
            imgs.push(transformImgSet(c, data.path));
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
        id: `GRP_${getUniqueId()}`,
        notes: data.metadata.note ?? "",
        isMinor: data.metadata.isMinor,
        imgs: imgs,
        childGroups: childGroups
    }


}

export async function main() {
    let dataset: TreeNode<ImgInfo, DirInfo> = 
        JSON.parse((await fsAccess.readFile("./../fileTree.json")).toString());

    let outputTree = transformTree(dataset);

    // console.log(JSON.stringify(outputTree, null, "\t"));

    await fsAccess.writeFile("./../imageDisplayTree.json", JSON.stringify(outputTree, null, "\t"));


}

main();
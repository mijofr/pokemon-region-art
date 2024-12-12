import path from "path";
import { NodeFsAccess } from "./bits/node-fs-access";
import { IXmlNd, XmlNd, XmlNdText } from "../lib/xml-nd";
import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId, regionsDir, rootDirectory } from "./bits/utils";
import { Grouping, ImgFile, ImgSet } from "./transformFileTree";

let thumbnailsFolders = new Set<string>();
let thumbnailsPaths: [string, string][] = [];

function parseImageSet(iSet: ImgSet, pth: string[]) {
    thumbnailsPaths.push([iSet.thumbnailSrcPath, iSet.thumbnailPath]);

    thumbnailsFolders.add(path.dirname(iSet.thumbnailPath));
}


async function createThumbnails(filePaths: [string,string][]): Promise<null> {

    for (let item of filePaths) {

        let thumbWidth = 350;
        let thumbHeight = 280;


        let srcPath = path.join(rootDirectory,item[0]);
        let destPath = path.join(rootDirectory, item[1]);

        console.log("--")
        console.log(srcPath);
        console.log(destPath);

        let cmd = `magick convert \"${srcPath}\"  -resize ${thumbWidth}x${thumbHeight} -quality 80 \"${destPath}\"`;
        let result = await execPromise(cmd, {'shell': 'powershell.exe'});
    }

    return null;
}


function parseGroup(grp: Grouping) {
    for (let i of grp.imgs) {
        parseImageSet(i, grp.path);
    }
    for (let g of grp.childGroups) {
        parseGroup(g);
    }

}

export async function ensureThumbnailDirs(dirList: string[]) {
    for (let d of dirList) {
        let fullDir = path.join(rootDirectory, d);
        await fsAccess.ensureDir(fullDir);
    }
}

export async function generateThumbs() {

    console.log(path.dirname("regions\\Ferrum.webp"));
    

    let dataset: Grouping = 
        JSON.parse((await fsAccess.readFile("./../imageDisplayTree.json")).toString());

    parseGroup(dataset);

    let items = Array.from(thumbnailsFolders);
    items.sort((a,b) => { return a.length - b.length });
    ensureThumbnailDirs(items);

    createThumbnails(thumbnailsPaths);

    console.log(items);

}

generateThumbs();
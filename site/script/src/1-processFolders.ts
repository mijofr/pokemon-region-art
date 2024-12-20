import { cleanTree, convertTreeAsync, flattenTree, SetEnumeratedNames, TreeNode } from "../lib/tree-node";
import { NodeFsAccess } from "./bits/node-fs-access";
import * as path from "path";
import { WebPInfo } from "webpinfo";
import * as sizeOf from "image-size";
import { promisify } from "util";
import { DirInfo, ImgInfo } from "src/types";
import { execPromise, fsAccess, getUniqueId, roundToSig } from "./bits/utils";
import { rootDirectory, regionsDir, thumbnailsDir } from "./bits/utils";

//https://www.npmjs.com/package/calipers
// https://www.npmjs.com/package/image-size
// https://www.npmjs.com/package/webpinfo


const sizeOfPromise = promisify(sizeOf.imageSize)

const LIMITSIZE: boolean = true;
const LIMITTO: number = 2;

const imgFormats: string[] = 
    ["png", "avif", "gif", "jpg", "jpeg", "jfif", "pjpeg", "pjp", "webp", "bmp", "tif", "tiff", "heic"];

export interface FormatInfo {
    width: number;
    height: number;
    lossless: boolean;
    quality: number;
}

function isImgExtension(ext: string): boolean {
    ext = ext.toLocaleLowerCase();
    if (ext.startsWith(".")) {
        ext = ext.substring(1);
    }
    if (imgFormats.includes(ext)) {
        return true;
    }
    return false;
}

async function getWebPImageInfo(filePath: string): Promise<FormatInfo> {
    const infoo = (await WebPInfo.from(filePath)).summary;
    return {
        width: infoo.width ?? -1,
        height: infoo.height ?? -1,
        lossless: infoo.isLossless,
        quality: -1
    };
}

async function getOtherImageInfo(filePath: string): Promise<FormatInfo> {

    try {

        const infoo = await sizeOfPromise(filePath);
        let imgType = (infoo.type ?? "").toLocaleLowerCase();

        return {
            width: infoo.width ?? -1,
            height: infoo.height ?? -1,
            lossless: imgType == "png",
            quality: -1
        };

    } catch (e) {
        console.error("Error processing " + filePath);
        console.error(e);
        throw(e);
    }

}

async function getImageFileInfo(nom: string): Promise<ImgInfo> {

    let ext: string = path.extname(nom).substring(1);

    let formatInfo: FormatInfo;
    if (ext.toLocaleLowerCase() == "webp") {
        let info = await getWebPImageInfo(nom);
        formatInfo = {
            width: info.width,
            height: info.height,
            lossless: info.lossless,
            quality: info.quality
        }
    } else {
        let info = await getOtherImageInfo(nom)
        formatInfo = {
            width: info.width,
            height: info.height,
            lossless: info.lossless,
            quality: info.quality
        }
    }

    let filesize = await fsAccess.getFilesize(nom);

    let name = path.basename(nom, path.extname(nom));
    let relPath = path.relative(regionsDir,nom);

    let thumbDir = path.dirname(path.join(thumbnailsDir, relPath));
    let thumbPath = path.join(thumbDir, name + ".jpg");


    return {
        path: nom,
        enumeratedName: "",
        relPath: relPath,
        thumbPath: thumbPath,
        name: name,
        extension: ext,
        width: formatInfo.width,
        height: formatInfo.height,
        lossless: formatInfo.lossless,
        filesize: filesize,
        quality: formatInfo.quality,
        aspect: roundToSig(formatInfo.width / formatInfo.height, 4)
    }
}

async function getImageInfoTree(tree: TreeNode<string, DirInfo>): Promise<TreeNode<ImgInfo, DirInfo>> {
    let updatedTree = await convertTreeAsync(tree, getImageFileInfo)
    return updatedTree;
}

async function readNote(noteFile: string): Promise<string> {
    return (await fsAccess.readFile(noteFile)).toString();
}

async function WalkDir(d: string, treePath: string[], depth: number, isRoot: boolean = false): Promise<TreeNode<string, DirInfo>> {
    
    let currentDir = path.basename(d);

    console.log("doing dir", d, currentDir);

    let fileList = await fsAccess.readDirectory(d);

    if (LIMITSIZE) {
        if (isRoot) {
            fileList = fileList.filter(n => { 
                return n.name.toLocaleLowerCase().charCodeAt(0) - 97 <= LIMITTO;
            })
        }
    }

    if (!isRoot) {
        treePath = treePath.concat([currentDir]);
    }

    let isMinor: boolean = (currentDir.toLocaleLowerCase().trim() == "locations");

    isMinor = isMinor || fileList.filter(n => n.isFile)
        .map(n=>n.name.toLocaleLowerCase().trim())
        .includes("minor");


    let meta: DirInfo = {
        fullPath: path.resolve(d),
        uniqueIdString: getUniqueId().toString(),
        depth: depth,
        isMinor: isMinor
    }
    
    let childDirs = await Promise.all(fileList
        .filter(m => m.isDirectory == true)
        .map(m => m.name)
        .map(m => WalkDir(path.join(d, m), treePath, depth + 1)));

    let hasNotesItem = fileList.filter(n => n.isFile)
        .map(n=>n.name.toLocaleLowerCase().trim())
        .includes("notes.txt");

    if (hasNotesItem) {

        console.log("has notes", currentDir)
        meta.note = await readNote(path.join(d, "notes.txt"))
    };

    let fileItems = 
        fileList.filter(n => n.isFile)
        .filter(n => {
            return isImgExtension(path.extname(n.name))
        })
        .map(n => n.name)
        .map(n => path.join(path.resolve(d), n));


    return {
        name: currentDir,
        path: isRoot ? [] : treePath,
        metadata: meta,
        children: childDirs,
        items: fileItems
    }

}


export async function WalkFolders() {

    let fileTree = await WalkDir(regionsDir, [], 0, true);
    fileTree = cleanTree(fileTree);


    

    fsAccess.writeFile("./../rawFileTree.json", JSON.stringify(fileTree, null, "\t"));


    console.log("retrieving image info");
    let imgFileTree = await getImageInfoTree(fileTree);
    console.log("image info retrieved");

    SetEnumeratedNames(imgFileTree);

    // console.log(JSON.stringify(imgFileTree, null, "\t"));

    await fsAccess.writeFile("./../fileTree.json", JSON.stringify(imgFileTree, null, "\t"));


}

export async function main() {
    await WalkFolders();
}
main();
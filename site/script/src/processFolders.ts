import { cleanTree, convertTreeAsync, flattenTree, SetEnumeratedNames, TreeNode } from "../lib/tree-node";
import { NodeFsAccess } from "./bits/node-fs-access";
import * as path from "path";
import { WebPInfo } from "webpinfo";
import * as sizeOf from "image-size";
import { promisify } from "util";
import { DirInfo, ImgInfo } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";
import { rootDirectory, regionsDir, thumbnailsDir } from "./bits/utils";

//https://www.npmjs.com/package/calipers
// https://www.npmjs.com/package/image-size
// https://www.npmjs.com/package/webpinfo


const sizeOfPromise = promisify(sizeOf.imageSize)

  

export interface FormatInfo {
    width: number;
    height: number;
    lossless: boolean;
}

async function getWebPImageInfo(filePath: string): Promise<FormatInfo> {
    const infoo = (await WebPInfo.from(filePath)).summary;
    return {
        width: infoo.width ?? -1,
        height: infoo.height ?? -1,
        lossless: infoo.isLossless
    };
}

async function getOtherImageInfo(filePath: string): Promise<FormatInfo> {
    const infoo = await sizeOfPromise(filePath);
    let imgType = (infoo.type ?? "").toLocaleLowerCase();

    return {
        width: infoo.width ?? -1,
        height: infoo.height ?? -1,
        lossless: imgType == "png"
    };
}

async function getImageFileInfo(nom: string): Promise<ImgInfo> {

    let ext: string = path.extname(nom).substring(1);

    let formatInfo: FormatInfo;
    if (ext.toLocaleLowerCase() == "webp") {
        let info = await getWebPImageInfo(nom);
        formatInfo = {
            width: info.width,
            height: info.height,
            lossless: info.lossless
        }
    } else {
        let info = await getOtherImageInfo(nom)
        formatInfo = {
            width: info.width,
            height: info.height,
            lossless: info.lossless
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
        filesize: filesize
    }
}

async function getImageInfoTree(tree: TreeNode<string, DirInfo>): Promise<TreeNode<ImgInfo, DirInfo>> {
    let updatedTree = await convertTreeAsync(tree, getImageFileInfo)
    return updatedTree;
}

async function WalkDir(d: string, treePath: string[], depth: number, isRoot: boolean = false): Promise<TreeNode<string, DirInfo>> {
    

    let currentDir = path.basename(d);

    let fileList = await fsAccess.readDirectory(d);

    if (!isRoot) {
        treePath = treePath.concat(currentDir);
    }

    let meta: DirInfo = {
        fullPath: path.resolve(d),
        uniqueIdString: getUniqueId().toString(),
        depth: depth,
        isMinor: (currentDir.toLocaleLowerCase().trim() == "locations")
    }
    
    let childDirs = await Promise.all(fileList
        .filter(m => m.isDirectory == true)
        .map(m => m.name)
        .map(m => WalkDir(path.join(d, m), treePath, depth + 1)));

    let fileItems = fileList.filter(n => n.isFile).map(n => n.name).map(n => path.join(path.resolve(d), n));


    return {
        name: currentDir,
        path: isRoot ? [] : treePath,
        metadata: meta,
        children: childDirs,
        items: fileItems
    }

}


async function ensureThumbnailDirs(tree: TreeNode<ImgInfo, DirInfo>): Promise<null> {
    let relPath = path.relative(regionsDir, tree.metadata.fullPath);
    let thumbPath = path.join(thumbnailsDir, relPath);
    await fsAccess.ensureDir(thumbPath);

    for (let i of tree.children) {
        await ensureThumbnailDirs(i);
    }
     return null;
}

async function createThumbnails(tree: TreeNode<ImgInfo, DirInfo>): Promise<null> {
    let thumbSet = flattenTree(tree);

    for (let item of thumbSet) {

        let thumbWidth = 350;
        let thumbHeight = 280;

        let cmd = `magick convert \"${item.path}\"  -resize ${thumbWidth}x${thumbHeight} -quality 80 \"${item.thumbPath}\"`;
        let result = await execPromise(cmd, {'shell': 'powershell.exe'});
    }

    return null;
}


async function WalkTest() {
    let fileTree = await WalkDir(regionsDir, [], 0, true);
    fileTree = cleanTree(fileTree);


    console.log(JSON.stringify(fileTree, null, "\t"));

    fsAccess.writeFile("./../rawFileTree.json", JSON.stringify(fileTree, null, "\t"));


    console.log("retrieving image info");
    let imgFileTree = await getImageInfoTree(fileTree);
    console.log("image info retrieved");

    SetEnumeratedNames(imgFileTree);

    console.log(JSON.stringify(imgFileTree, null, "\t"));

    fsAccess.writeFile("./../fileTree.json", JSON.stringify(imgFileTree, null, "\t"));

    await ensureThumbnailDirs(imgFileTree);


    console.log("generating thumbnails");
    await createThumbnails(imgFileTree);
    console.log("thumbnail generation complete");

    console.log();
}
async function main() {
    await WalkTest();
}
main();
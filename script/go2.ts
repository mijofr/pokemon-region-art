import { exec } from "child_process";
import { convertTreeAsync, flattenTree, TreeNode } from "./lib/tree-node";
import { NodeFsAccess } from "./node-fs-access";
import * as path from "path";
import { WebPInfo } from "webpinfo";
import * as sizeOf from "image-size";
import { promisify } from "util";
import { DirInfo, ImgInfo } from "types";

let fsAccess = new NodeFsAccess();

//https://www.npmjs.com/package/calipers
// https://www.npmjs.com/package/image-size
// https://www.npmjs.com/package/webpinfo

function execPromise(command, opts): Promise<string> {
    return new Promise(function(resolve, reject) {
        exec(command, opts, (error, stdout, stderr) => {
            if (error) {
                console.error(error)
                reject(error);
                return;
            }
            if (stdout != null) {
                resolve(stdout.toString().trim());
            } else {
                return null;
            }
            
        });
    });
}

const sizeOfPromise = promisify(sizeOf.imageSize)

let idStart = 10003;

function getUniqueId() {
    let returnVal = idStart;
    idStart = idStart + 1;
    return idStart;
}
  

export interface FormatInfo {
    width: number;
    height: number;
    lossless: boolean;
}

async function getWebPInfo(filePath: string): Promise<FormatInfo> {
    const infoo = (await WebPInfo.from(filePath)).summary;
    return {
        width: infoo.width ?? -1,
        height: infoo.height ?? -1,
        lossless: infoo.isLossless
    };
}

async function getOtherInfo(filePath: string): Promise<FormatInfo> {
    const infoo = await sizeOfPromise(filePath);
    let imgType = (infoo.type ?? "").toLocaleLowerCase();

    return {
        width: infoo.width ?? -1,
        height: infoo.height ?? -1,
        lossless: imgType == "png"
    };
}



async function getImageInfo(nom: string): Promise<ImgInfo> {

    let ext: string = path.extname(nom).substring(1);

    let formatInfo: FormatInfo;
    if (ext.toLocaleLowerCase() == "webp") {
        let info = await getWebPInfo(nom);
        formatInfo = {
            width: info.width,
            height: info.height,
            lossless: info.lossless
        }
    } else {
        let info = await getOtherInfo(nom)
        formatInfo = {
            width: info.width,
            height: info.height,
            lossless: info.lossless
        }
    }

    let filesize = await fsAccess.getFilesize(nom);

    let name = path.basename(nom, path.extname(nom));
    let relPath = path.relative(path.resolve("./../regions"),nom);

    let thumbDir = path.dirname(path.resolve(path.join("./../thumbnails", relPath)));
    let thumbPath = path.join(thumbDir, name + ".jpg");


    return {
        path: nom,
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
    let updatedTree = await convertTreeAsync(tree, getImageInfo)
    return updatedTree;
}

async function WalkDir(d: string, treePath: string[], isRoot: boolean = false): Promise<TreeNode<string, DirInfo>> {
    

    let currentDir = path.basename(d);

    let fileList = await fsAccess.readDirectory(d);

    if (!isRoot) {
        treePath = treePath.concat(currentDir);
    }

    let meta: DirInfo = {
        fullPath: path.resolve(d),
        uniqueIdString: getUniqueId().toString()
    }
    
    let childDirs = await Promise.all(fileList
        .filter(m => m.isDirectory == true)
        .map(m => m.name)
        .map(m => WalkDir(path.join(d, m), treePath)));

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
    let relPath = path.relative("./../regions", tree.metadata.fullPath);
    let thumbPath = path.resolve(path.join("./../thumbnails", relPath));
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
    let res = await WalkDir("D:\\Users\\Michael\\repos\\pokemon-regions\\regions", [], true);

    let res2 = await getImageInfoTree(res);
    console.log(JSON.stringify(res, null, "\t"));

    fsAccess.writeFile("./fileTree.json", JSON.stringify(res2, null, "\t"));

    await ensureThumbnailDirs(res2);
    await createThumbnails(res2);

    console.log();
}

async function generatePage() {

}

WalkTest();
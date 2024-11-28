import { exec } from "child_process";
import { convertTreeAsync, TreeNode } from "./lib/tree-node";
import { NodeFsAccess } from "./node-fs-access";
import * as path from "path";

let fsAccess = new NodeFsAccess();

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

export interface ImgInfo {
    name: string
}

async function createThumbnails(tree: TreeNode<ImgInfo, null>) {
    
}
 
async function getImageInfo(nom: string): Promise<ImgInfo> {
    return {
        name: nom
    }
}

async function getImageInfoTree(tree: TreeNode<string, null>) {
    let updatedTree = await convertTreeAsync(tree, getImageInfo)
}

async function WalkDir(d: string, treePath: string[], isRoot: boolean = false): Promise<TreeNode<string, null>> {
    

    let currentDir = path.basename(d);

    let fileList = await fsAccess.readDirectory(d);

    if (!isRoot) {
        treePath = treePath.concat(currentDir);
    }
    
    let childDirs = await Promise.all(fileList
        .filter(m => m.isDirectory == true)
        .map(m => m.name)
        .map(m => WalkDir(path.join(d, m), treePath)));

    let fileItems = fileList.filter(n => n.isFile).map(n => n.name);


    return {
        name: currentDir,
        path: isRoot ? [] : treePath,
        metadata: null,
        children: childDirs,
        items: fileItems
    }

}

async function WalkTest() {
    let res = await WalkDir("D:\\Users\\Michael\\repos\\pokemon-regions\\regions", [], true);
    console.log(JSON.stringify(res, null, "\t"));
}

async function main() {

    let i1 = "D:\\Users\\Michael\\repos\\pokemon-regions\\regions\\Oblivia.webp";
    let i2 = "D:\\Users\\Michael\\repos\\pokemon-regions\\regions\\Aeos Island\\Aeos Island.webp";


    let filename = "Almia.webp"
    let cmd = `webpinfo \"${i2}\" | Select-String -Pattern \"^\\s*Format\"`;
    console.log(cmd);
    let r = await execPromise(cmd, {'shell': 'powershell.exe'});
    console.log(r);



}


WalkTest();
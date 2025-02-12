import { ListObjectsV2Output } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import { DirInfo, ImgInfo } from './types';
import { flattenTree, TreeNode } from "./lib/tree-node"


function main() {

    let fileTree: TreeNode<ImgInfo, DirInfo> = JSON.parse(fs.readFileSync("./fileTree.json").toString());
    let ObjectsList: ListObjectsV2Output = JSON.parse(fs.readFileSync("./ObjectsList.json").toString());



    let flattenedFiles = flattenTree(fileTree);

}

main();
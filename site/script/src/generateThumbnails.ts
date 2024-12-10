import path from "path";
import { NodeFsAccess } from "./bits/node-fs-access";
import { IXmlNd, XmlNd, XmlNdText } from "../lib/xml-nd";
import { TreeNode } from "../lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "src/types";
import { execPromise, fsAccess, getUniqueId } from "./bits/utils";
import { Grouping, ImgFile, ImgSet } from "./transformFileTree";


function parseImageSet(iSet: ImgSet, path: string[]) {
    
}

function parseGroup(grp: Grouping) {
    for (let i of grp.imgs) {
        parseImageSet(i, grp.path);
    }
    for (let g of grp.childGroups) {
        parseGroup(g);
    }

}

export async function generateThumbs() {
    

    let dataset: Grouping = 
        JSON.parse((await fsAccess.readFile("./../imageDisplayTree.json")).toString());

    parseGroup(dataset);



}

generateThumbs();
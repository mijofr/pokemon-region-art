import path from "path";
import { NodeFsAccess } from "./node-fs-access";
import { XmlNd, XmlNdText } from "./lib/xml-nd";
import { TreeNode } from "./lib/tree-node";
import { DirInfo, FileSizeDesc, ImgInfo, Size2 } from "types";


let fsAccess = new NodeFsAccess();

let outputLines: string[] = [];

function makeId(sectName: string, name: string) {
    let sName = sectName.toLocaleLowerCase().split(" ").join("-");
    let nName = name.toLocaleLowerCase().split(" ").join("-");
    return `${sName}_${nName}`;
}

function wrapPage(content: string): string {
    return `<html lang="en">
	<head>
		<meta charset="utf-8">

		<title>Pokemon World Map Art</title>
		<meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="icon" type="image/png" href="./favicon.png" />


        <style>
            html, body {
                background-color: #14171f;
            }
            body {
                opacity: 0;
            }
        </style>
		<link rel="stylesheet" type="text/css" href="./styles/normalize.css">
		<link rel="stylesheet" type="text/css" href="./styles/styles.css">
		<link rel="preconnect" href="https://fonts.googleapis.com">
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
		<link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300..800;1,300..800&family=PT+Sans:wght@400;700&family=Droid+Sans+Mono&display=block" rel="stylesheet">
		<link href="https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=block" rel="stylesheet">

        <svg width="60" height="85" version="1.1" viewBox="0 0 60 85" xmlns="http://www.w3.org/2000/svg">
			<defs>
				<filter id="shadowBlur"	color-interpolation-filters="sRGB">
					<feGaussianBlur id="feGaussianBlur15" result="blur" stdDeviation="2 2" />
				</filter>
				<symbol id="pageSymbol" width="75" height="100" viewBox="0 0 75 100">
					<path fill="#000000" filter="url(#shadowBlur)" opacity="0.7" style="mix-blend-mode:multiply"
						d="m9.863 3.507c-3.525 0-6.363 2.838-6.363 6.363v72.11c0 3.525 2.838 6.363 6.363 6.363h47.27c3.525 0 6.363-2.838 6.363-6.363v-57.27l-21.21-21.21z" />
					<path fill="currentColor"
						d="m6.363 7e-3c-3.525 0-6.363 2.838-6.363 6.363v72.11c0 3.525 2.838 6.363 6.363 6.363h47.27c3.525 0 6.363-2.838 6.363-6.363v-57.27l-21.21-21.21z" />
					<path d="m38.786 0v18.03c0 1.763 1.419 3.182 3.182 3.182h18.03z" style="mix-blend-mode:multiply" fill="#000000" opacity=".333"  />
					<g opacity=".6" style="mix-blend-mode:hard-light">
						<rect x="12.75" y="38.75" width="34.5" height="27.6" fill="#b3b3b3" />
						<path d="m38.63 48-18.35 18.35h26.96v-9.734z" fill="#4d4d4d"  />
						<path d="m21.4 52.5-8.498 8.498v5.352h22.35z" fill="#666666" />
						<circle cx="21" cy="46" r="3" fill="#ffffff" />
						<rect x="12.75" y="38.75" width="34.5" height="27.6" ry=".157" fill="none" stroke="#333333" stroke-width="1.5" />
					</g>
				
				</symbol>
			</defs>
		</svg>


	</head>
	<body>
${content}
	</body>
</html>
`
}


function generateLink(itemUrl: string, 
    res: Size2, size: FileSizeDesc, fileFormat: string) {

        let fileFormatDesc = fileFormat;
        if (fileFormat == "webp-lossless") {
            fileFormatDesc = `webp <span class="normal-weight">lossless</span>`
        }

return `
<a href="${itemUrl}" class="fileLink ${fileFormat}">
    <div class="pageIcon">
        <svg class="pageIcon-svg" viewBox="0 0 60 85"><use href="#pageSymbol" /></svg>
    </div>
    <div class="fileData">
        <div>
            <span class="resolution">${res.w}×${res.h}</span>
            <span class="format"><span>${fileFormatDesc}</span></span>
        </div>
        <div>
            <span class="size">${size.size}<span>${size.unit}</span></span>
        </div>
    </div>
</a>
`
}

function roundToThree(number): number {
    return (Math.round(number * 100)/100)
}

function getSizeString(fsize: number): FileSizeDesc {


    if (fsize >= (1024*1024)) {
        let mb = roundToThree(fsize / (1024*1024));

        return {
            size: mb,
            unit: "MB"
        }

    } else {
        let kb = roundToThree(fsize / 1024);
        return {
            size: kb,
            unit: "kB"
        }
    }
}

function translateImage(img: ImgInfo): XmlNd {

    let imgContainerNode = new XmlNd("div").addAttr("class", "img-container");

    let imgNode = new XmlNd("div")
        .addAttr("class", "img-frame")
        
    let thumbPath = path.relative(path.resolve("./"), img.thumbPath);
    let linkPath = path.join("./../regions", img.relPath);

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb-bg"))

    imgNode.addChild(new XmlNd("img", true)
        .addAttr("src", thumbPath)
        .addAttr("class", "thumb"))

    let descNode = new XmlNd("div")
        .addAttr("class", "img-desc")
        .addChild((new XmlNd("h3")).addChild(new XmlNdText(img.name)))
        

    let fformat = img.extension.toLocaleLowerCase();
    if (fformat == "webp" && img.lossless) {
        fformat = "webp-lossless";
    }

    descNode.addTextChild(
        generateLink(linkPath ,{w: img.width, h: img.height}, getSizeString(img.filesize), fformat)
    )

    imgContainerNode.addChild(imgNode).addChild(descNode);
    return imgContainerNode;
}


function translateNode(dataNode: TreeNode<ImgInfo, DirInfo>, level: number = 0): XmlNd {

    let htmlNode = new XmlNd("div");


    let classes: string[] = [];
    classes.push("groupNode");
    classes.push(`node-level-${level.toString()}`);
    if (dataNode.name.toLocaleLowerCase().trim() == "locations") {
        classes.push("locations")
    }

    htmlNode.addAttr("class", classes.join(" "));
    htmlNode.addChild((new XmlNd("h2")).addChild(new XmlNdText(dataNode.name)));

    if (dataNode.items.length > 0) {
        let imgSetNode = new XmlNd("div")
            .addAttr("class", "group-imgs")

        for (let i of dataNode.items) {
            imgSetNode.addChild(translateImage(i));
        }
        htmlNode.addChild(imgSetNode); 
    }

    if (dataNode.children.length > 0) {
        
        dataNode.children.sort((a,b) => {
            if (a.name.toLocaleLowerCase().trim() == "locations") {
                return 1;
            }
            if (b.name.toLocaleLowerCase().trim() == "locations") {
                return -1;
            }

            return a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase());
        })

        let childSetNode = new XmlNd("div")
            .addAttr("class", "group-children")

        for (let c of dataNode.children) {
            childSetNode.addChild(translateNode(c, level + 1));
        }
        htmlNode.addChild(childSetNode); 
    }







    return htmlNode;

}

async function main() {

    let dataset: TreeNode<ImgInfo, DirInfo> = 
        JSON.parse((await fsAccess.readFile("./fileTree.json")).toString());


    let htmlTree = translateNode(dataset);


    let resultString = wrapPage(htmlTree.getOutput(2));

    
    fsAccess.writeFile("./index.html", resultString);

}

main();
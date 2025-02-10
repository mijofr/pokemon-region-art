import { timeSince } from "./bits/utils";
import { getHashFs, getHashPs } from "./bits/file-hash";
import { NodeFsAccess } from "./bits/node-fs-access";

export const fsAccess = new NodeFsAccess();



export async function main() {
    const filePath: string = "D:\\Users\\Michael\\repos\\pokemon-region-art\\regions\\Alola\\_SunMoon\\alola-full.png"



    let tStart = performance.now();
    console.log(await getHashFs(filePath));
    console.log(timeSince(tStart));

    tStart = performance.now();
    console.log(await getHashPs(filePath));
    console.log(timeSince(tStart));

}
console.log("bwop");
main();
import { main as main1 } from "./1-processFolders";
import { main as main2 } from "./2-transformFileTree";
import { main as main3 } from "./3-generateThumbnails";
import { main as main4 } from "./4-generateHtmlMk2";


async function main() {
    await main1();
    await main2();
    await main3();
    await main4();
}
main();
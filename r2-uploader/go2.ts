import { S3Wrap } from "./S3Wrap";

import * as fs from 'fs';

// remember to swap these out and put the new ones in secret storage before public'ing repo

const configItems = {
    accountId: 'b5c037f017d43b6779b432cdf80f8fa0',
    accessKeyId: '2cef0b99024920aea528136a0163de5f',
    secretAccessKey: '012a8199f5b75fddcf0e267e179214247552a97eb1f0cff8e9f5de8b83eb904b',
    cfApiToken: 'Rj1JG3aZ6_A-5HUHeZALXzwWsrErht8xbBDfI4gl',
    cfJurisEndpoint: 'https://b5c037f017d43b6779b432cdf80f8fa0.r2.cloudflarestorage.com'
}

async function main() {
    let mainer = new S3Wrap(
        configItems.accountId,
        configItems.accessKeyId,
        configItems.secretAccessKey,
        configItems.cfJurisEndpoint,
        'region-art'
    );
    await mainer.init();

    // Upload keys like this:     uploadFileFromFs("regions/PokéPark.jpg", ".\\regions\\PokéPark.jpg"))


    // console.log(await mainer.uploadFileFromFs("regions/PokéPark.jpg", ".\\regions\\PokéPark.jpg"))

    
    let ObjectsList = await mainer.GetObjectsList();
    fs.writeFileSync("ObjectsList.json", JSON.stringify(ObjectsList, null, "\t"));

}
main();
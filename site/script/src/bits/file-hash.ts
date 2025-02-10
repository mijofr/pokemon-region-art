import * as crypto from "crypto"
import { IFSWrap } from "src/types";
import { execPromise, IsNullOrWhitespace } from "./utils";
import * as fs from "fs-extra";

export async function getHashFs(filePath: string): Promise<string> {

    const fileBuffer = await fs.readFile(filePath);
		const hashSum = crypto.createHash('md5');
		hashSum.update(fileBuffer);

        return hashSum.digest('hex').toString();
}

export async function getHashPs(filePath: string): Promise<string> {
    let cmd: string = `Get-FileHash -Algorithm MD5 \"${filePath}\" | ConvertTo-JSON`
    let resultStr = (await execPromise(cmd, {shell: "powershell"})).toString();
    let result = JSON.parse(resultStr.toString()).Hash;

    if (result == undefined || IsNullOrWhitespace(result)) {
        throw "failed hash result";
    }
    return result;

}

export function  hashToBase36Str(string): string {
    return BigInt('0x' + string.toString()).toString(36);
}
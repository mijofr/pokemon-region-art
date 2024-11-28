import { exec } from "child_process";


function execPromise(command, opts): Promise<string> {
    return new Promise(function(resolve, reject) {
        exec(command, opts, (error, stdout, stderr) => {
            if (error) {
                console.error(error)
                reject(error);
                return;
            }

            resolve(stdout.trim());
        });
    });
}


async function main() {

    let i1 = "D:\\Users\\Michael\\repos\\pokemon-regions\\regions\\Oblivia.webp";
    let i2 = "D:\\Users\\Michael\\repos\\pokemon-regions\\regions\\Aeos Island.webp";


    let cmd = "";
    let r = await execPromise("webpinfo Almia.webp", {'shell': 'powershell.exe'});
    console.log(r);



}

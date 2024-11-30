import { performance } from 'perf_hooks';

export function IsNullOrWhitespace(str: string) {
    return ((str == null) || str.trim() == "")
  }
  
  
  
export function escapeRegExp(str: string): string {
	return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(str:string , find:string, replace: string) {
	return str.replace(new RegExp(escapeRegExp(find), 'gi'), replace);
}


export function replaceAllStrings(content: string, replaces: string[][]): string {
    for (var item of replaces) {
        content = replaceAll(content, item[0], item[1]);
    }    
    return content;
}


export function timeSince(n: number): string {
	return `${((performance.now() - n)/1000).toPrecision(3)}s`;
}





export async function getImgDimen(filepath: string): Promise<[number, number]> {
	let filename = path.basename(filepath);
	let dir = path.dirname(filepath);

	let [xResOrig, yResOrig]
		= (await execCmd(-1, `magick identify ${filename}`, dir))
			.toString().split(" ")[2].split("x").map(m => parseInt(m, 10));
	return [xResOrig, yResOrig];
}
+



export async function getAllFilesInDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = entries
        .filter(file => !file.isDirectory())
        .map(file => file.name);

    const folders = entries.filter(folder => folder.isDirectory());
    for (const folder of folders) {
        let n = (await getAllFilesInDir(path.join(dir,folder.name))).map(l => path.join(folder.name, l));
		files.push(...n);
	}
    return files;
}


export async function getHashes(dir: string): Promise<string[][]> {
	let filesInDir = await getAllFilesInDir(dir);
	return await Promise.all(filesInDir.map(async(n) => [n,await getHash(path.join(dir, n))]));
}
export async function getHash(file: string): Promise<string> {
	if (file.endsWith("png")) {
		return getImageHash(file);
	} else {
		const fileBuffer = await fs.readFile(file);
		const hashSum = crypto.createHash('sha256');
		hashSum.update(fileBuffer);
		return BigInt('0x' + hashSum.digest('hex').toString()).toString(36);
	}
}




export function next_power_of_2(x) {
	return Math.pow(2, Math.ceil(Math.log(x) / Math.log(2)));
}

export function execCmd(id: number, cmd: string, folder: string = "", show: boolean = false): Promise<string> {
	let opts: child_process.ExecOptions = folder !== "" ? { cwd: folder } : {};
	return new Promise((resolve, reject) => {
		if (show || DEBUG) {

			let idStr = "() "
			if (id >= 0) {
				idStr = `(${id}) `;
			}

			if (folder) {
				console.log(colors.grey(idStr + folder))
			}
			console.log(colors.bold.yellow(idStr + cmd));
		}
		child_process.exec(cmd, opts, (error, stdout, stderr) => {
			if (error) {
				console.warn(error);
			}
			resolve(stdout ? stdout : stderr);
		});
	});
}

export async function execCmds(id: number, cmds: string[], dir: string): Promise<string[]> {
	let results: string[] = [];
	for (let c of cmds) {
		results.push(await execCmd(id, c, dir));
	}
	return results;
}

export async function ensureEmptyDir(dirPath: string) {
	await fs.ensureDir(dirPath);
	await fs.emptyDir(dirPath);
}

export function escapeRegExp(str: string): string {
	return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function replaceAll(str, find, replace) {
	return str.replace(new RegExp(escapeRegExp(find), 'gi'), replace);
}

export function replaceAll(inp: string, from: string, to: string): string {
	if (inp != null) {
		return inp.split(from).join(to);
	} else {
		return null;
	}
}


export function donePromise(): Promise<void> {
	return new Promise<void>((resolve, reject) => {
		resolve();
	});
}

export function toJsonStr(o: object): string {
	return JSON.stringify(o, null, "\t");
}


export function timeSince(n: number): string {
	return `${((performance.now() - n)/1000).toPrecision(3)}s`;
}


export function roundUpDivisor(num: number, fact: number) {
    return Math.ceil(num / fact) * fact;
}

export async function writeStreamToFile(path: string, read: stream.Readable): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        const wStream = fs.createWriteStream(path)
        read.pipe(wStream)
        wStream.on('error', (err) => reject(err) )
        wStream.on('finish', () => resolve() );
    });
}



export function getSig(int: number): number {
	return Math.floor(Math.log10(int) + 1);
}
export function roundTo(inp: number, order: number): number {
	return Math.round((inp + Number.EPSILON) * Math.pow(10, order)) / Math.pow(10, order);
}
export function roundToSig(inp: number, order: number): number {
	return roundTo(inp, 0 - getSig(inp) + order);
}
export function roundUpTo(inp: number, order: number): number {
	return Math.ceil((inp + Number.EPSILON) * Math.pow(10, order)) / Math.pow(10, order);
}


export function clone<T>(inp: T): T {
	return JSON.parse(JSON.stringify(inp)) as T;
}


export function nullify(inp: string): string {
	if (!inp) {
		return null;
	}
	if (inp.trim() === "") {
		return null;
	}
	return inp;
}

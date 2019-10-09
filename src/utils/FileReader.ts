import * as fs from "fs";
import * as path from "path";

class FileReader {
	readFile(filePath: string) {
		const resolvedPath = path.resolve(__dirname, `../../${filePath}`);
		if (fs.existsSync(resolvedPath)) {
			return fs.readFileSync(resolvedPath);
		}
		throw new Error(`File ${resolvedPath} does not exist`);
	}
}

const fileReader = new FileReader();
export default fileReader;

import { Plugin } from 'vite';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, basename, join } from 'path';

function getAllSvgFiles(dir: string): Record<string, string> {
    const svgMap: Record<string, string> = {};

    function readDirectory(directory: string) {
        readdirSync(directory).forEach((file) => {
            const filePath = resolve(directory, file);
            const stat = statSync(filePath);

            if (stat.isDirectory()) {
                // Recursively read subdirectory
                readDirectory(filePath);
            } else if (file.endsWith('.svg')) {
                // Add SVG file to the map
                const svgContent = readFileSync(filePath, 'utf-8');
                const fileName = join(
                    basename(directory),
                    basename(file)
                ).replace(/\\/g, '/');
                svgMap[fileName] = svgContent;
            }
        });
    }

    readDirectory(dir);
    return svgMap;
}

export function svgIconsPlugin(svgDir: string): Plugin {
    const svgMap = getAllSvgFiles(svgDir);

    return {
        name: 'vite-plugin-svg-icons',
        resolveId(id) {
            if (id === 'virtual:svg-icons') {
                return id;
            }
        },
        load(id) {
            if (id === 'virtual:svg-icons') {
                return `
					export function getSvgIcon(name) {
						return ${JSON.stringify(svgMap)}[name];
					}
				`;
            }
        },
    };
}

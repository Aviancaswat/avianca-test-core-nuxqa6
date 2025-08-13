import fs from "fs";
import path from "path";
import sharp from "sharp";

const Utilities = {

    wrapText(text, maxWidth, fontSize) {
        const words = text.split(' ');
        let lines: string[] = [];
        let currentLine = '';

        words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (this.getTextWidth(testLine, fontSize) <= maxWidth) {
                currentLine = testLine;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    },
    getTextWidth(text, fontSize) {
        const characterWidth = fontSize * 0.4;
        return text.length * characterWidth;
    },
    async addTextToImage(imagePath: any, text: string) {
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        const footerHeight = 80;
        const padding = 30;
        const maxTextWidth = metadata.width - 2 * padding;
        const fontSize = 30;

        let lines = this.wrapText(text, maxTextWidth, fontSize);

        const svgText = `
            <svg width="${metadata.width}" height="${metadata.height}">
            <rect width="100%" height="${footerHeight}" x="0" y="${metadata.height - footerHeight}" fill="black" />
            
            ${lines.map((line: string, index: number) => `
                <text x="${metadata.width / 2}" y="${metadata.height - footerHeight + padding + index * (fontSize + 5)}"
                      font-size="${fontSize}" font-family="Arial" fill="white" text-anchor="middle" alignment-baseline="central">
                    ${line}
                </text>
            `).join('')}
            </svg>
        `;

        image.composite([{
            input: Buffer.from(svgText),
            gravity: 'northwest',
        }]);

        const tempFilePath = path.join(path.dirname(imagePath), 'temp-image.png');

        await image.toFile(tempFilePath);
        fs.renameSync(tempFilePath, imagePath);
    }
}

export { Utilities };


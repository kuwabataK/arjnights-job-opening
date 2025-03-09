import Tesseract from 'tesseract.js';
import tags from '../data/tags.json';

const tagNames = tags.map(tag => tag.name);

const convertCharList = {
    '狙': '狙撃',
    '先': '先鋒',
    '囲攻': '範囲攻撃',
    '強制': '強制移動',
    '移動': '強制移動',
    '発力': '爆発力',
    '再配': '高速再配置',
    '高速': '高速再配置',
    '速再': '高速再配置',
    '治': '治療',
    '前': '前衛',
    '近': '近距離',
    '避距': '遠距離',
    '装': '重装',
    '重': '重装',
    '弱': '弱化',
    '支': '支援',
    '範': '範囲攻撃',
    '化': '弱化',
    "召": "召喚",
}


export default class OCR {

    static async preProcessingImage(imageFile: File, threshold: number): Promise<File> {

        return new Promise((resolve) => {
            const image = new Image();
            const src = URL.createObjectURL(imageFile);
            image.src = src;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;
                canvas.width = image.width;
                canvas.height = image.height;
                ctx.drawImage(image, 0, 0);
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);


                // 特定の濃度以下の色をすべて黒にする
                for (let i = 0; i < imageData.data.length; i += 4) {
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const brightness = (r + g + b) / 3;
                    if (brightness < threshold) {
                        imageData.data[i] = 0;
                        imageData.data[i + 1] = 0;
                        imageData.data[i + 2] = 0;
                    }
                }

                ctx.putImageData(imageData, 0, 0);
                const invertedImage = new Image();
                invertedImage.src = canvas.toDataURL();
                invertedImage.onload = () => {
                    canvas.width = invertedImage.width;
                    canvas.height = invertedImage.height;
                    ctx.drawImage(invertedImage, 0, 0);
                    canvas.toBlob(blob => {
                        if (!blob) return;
                        const file = new File([blob], 'inverted.png', { type: 'image/png' });
                        URL.revokeObjectURL(src);
                        resolve(file);
                    });
                };
            }
        });
    }

    /**
     * 引数に指定された画像ファイルからテキストを抽出する
     * @param imageFile 
     * @returns 
     */
    static async recognize(imageFile: File): Promise<string> {
        const { data: { text } } = await Tesseract.recognize(
            imageFile,
            'jpn',
            {
                logger: m => console.log(m),

            }
        );
        console.log('解析が完了しました。文字列は以下です', text);
        return text;
    }

    static async _recognizeImageAndTag(imageFile: File, threshold: number): Promise<string[]> {
        const preProcessedImage = await this.preProcessingImage(imageFile, threshold);
        const text = await this.recognize(preProcessedImage);
        // Textのスペースや改行を削除する
        // 狙の文字列を狙撃に変換する
        // 先を先鋒に変換する
        // 囲攻を範囲攻撃に変換する
        let cleanedText = text.replace(/\s/g, '');

        Object.entries(convertCharList).forEach(([key, value]) => {
            cleanedText = cleanedText.replace(key, value);
        });

        // textの中に含まれているタグ名を抽出する
        const detectedTags = tagNames.filter(tagName => cleanedText.includes(tagName));
        console.log('抽出されたタグ一覧', detectedTags);
        return detectedTags;
    }

    /**
     * 引数に指定された画像ファイルからタグの名前の一覧を抽出する
     * @param imageFile 
     * @returns 
     */
    static async recognizeImageAndTag(imageFile: File): Promise<string[]> {
        let tags = await this._recognizeImageAndTag(imageFile, 255);
        let threshold = 255;
        // 環境によって黒塗りにする適切な閾値が違うので、タグが3つ以上抽出されるまで段階的に閾値を下げて検証を行う
        while (tags.length < 3 && threshold > 0) {
            threshold -= 20;
            tags = await this._recognizeImageAndTag(imageFile, threshold);
        }
        return tags;
    }
}
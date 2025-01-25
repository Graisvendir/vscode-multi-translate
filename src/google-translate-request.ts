import { IncomingMessage } from 'http';
import * as https from 'https';

export interface TranslateResult {
	lang: string,
	translatedText: string,
}

export class GoogleTranslateRequest {

    public async multiTranslate(text: string, langs: string[]) {
        const promiseList = langs.map(lang => {
			return this.translateOne(text, lang);
		});

		return await Promise.all(promiseList);
    }

    protected async translateOne(text: string, lang: string): Promise<TranslateResult> {
        return new Promise<TranslateResult>((resolve, reject) => {
            const request = https.request(
                this.getRequestOptions(text, lang),
                (result: IncomingMessage) => {
                    let translatedText = '';

                    result.on('data', (chunk) => {
                        translatedText += chunk;
                    });

                    result.on('end', () => {
                        // vscode.window.showInformationMessage(`Response: ${response}`);
                        resolve({
                            lang,
                            translatedText,
                        });
                    });
                },
            );

            request.on('error', error => {
                console.error(error.message);
                // vscode.window.showInformationMessage(`Обосрались на запросе ${lang}:(`);
                reject(error);
            });

            // Отправка данных
            // request.write(data);
            request.end();
        });
    }

    protected getRequestOptions(text: string, lang: string): https.RequestOptions {
        return {
            hostname: 'translation.googleapis.com',
            port: 443,
            path: `/language/translate/v2?q=${text}&source=ru&target=${lang}`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': 0,
            },
        };
    }

}
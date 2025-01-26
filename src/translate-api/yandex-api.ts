import { TranslateApi, TranslateApiOptions } from './types';
import { Fetch } from '../fetch';
import { WorkspaceConfiguration } from 'vscode';

interface ResponseBody {
    translations: {
        detectedLanguageCode: string,
        text: string,
    }[]
}

/**
 * Запрос перевода текста через API сервис Яндекс Переводчик.
 * Требует ключ API и folderId.
 * Не уверен, но кажется требует чутка денег.
 */
export class YandexApi implements TranslateApi {

    protected apiKey = '';
    protected folderId = '';

    applySettings(settings: WorkspaceConfiguration): void {
        this.apiKey = settings.get<string>('yandex.iam-key') ?? '';
        this.folderId = settings.get<string>('yandex.folder-id') ?? '';
    }

    async translate(
        textToTranslate: string,
        options: TranslateApiOptions,
    ): Promise<string> {

        if (!this.apiKey) {
            throw new Error("Ключ API DeepL пустой!");
        }

        const responseBody = await (new Fetch()).request(
            {
                hostname: 'translate.api.cloud.yandex.net',
                port: 443,
                path: '/translate/v2/translate',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            },
            JSON.stringify({
                folderId: this.folderId,
                texts: [ textToTranslate ],
                targetLanguageCode: options.toLangCode,
            }),
        );

        const jsonBody = <ResponseBody>JSON.parse(responseBody);

        console.log('!!!!!!! jsonBody', jsonBody); // TODO: console.log remove

        return jsonBody.translations.map(translate => translate.text).join('');
    }
}
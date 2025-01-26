import { TranslateApi, TranslateApiOptions } from './types';
import { Fetch } from '../fetch';
import { WorkspaceConfiguration } from 'vscode';

interface ResponseBody {
    translations: {
        'detected_source_language': string,
        text: string,
    }[]
}

/**
 * Запрос перевода текста через API сервиса DeepL.
 * Требует ключ API.
 * Есть бесплатная версия, но требует иностранную карту для подтверждения.
 */
export class DeeplApi implements TranslateApi {

    protected apiKey = '';

    applySettings(settings: WorkspaceConfiguration): void {
        this.apiKey = settings.get<string>('deepl-api-key') ?? '';
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
                hostname: 'translation.googleapis.com',
                port: 443,
                path: '/language/translate/v2',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
                },
            },
            JSON.stringify({
                text: [ textToTranslate ],
                'target_lang': options.toLangCode.toUpperCase(),
            }),
        );

        const jsonBody = <ResponseBody>JSON.parse(responseBody);

        return jsonBody.translations.map(translate => translate.text).join('');
    }
}
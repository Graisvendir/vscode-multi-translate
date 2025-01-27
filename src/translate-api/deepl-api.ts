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
    protected isApiPayed = false;
    protected freeHostName = 'api-free.deepl.com';
    protected payedHostName = 'api.deepl.com';

    async setup(settings: WorkspaceConfiguration): Promise<void> {
        this.apiKey = settings.get<string>('deepl.api-key') ?? '';
        this.isApiPayed = settings.get<boolean>('deepl.is-api-payed') ?? false;
    }

    async translate(
        textToTranslate: string,
        options: TranslateApiOptions,
    ): Promise<string> {

        if (!this.apiKey) {
            throw new Error("DeepL: Ключ API DeepL пустой!");
        }

        const responseBody = await (new Fetch()).request(
            {
                hostname: this.isApiPayed ? this.payedHostName : this.freeHostName,
                port: 443,
                path: '/v2/translate',
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
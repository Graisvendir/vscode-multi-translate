import { TranslateApi, TranslateApiOptions } from './types';
import { Fetch } from '../fetch';
import { WorkspaceConfiguration } from 'vscode';

interface TranslateResponseBody {
    translations: {
        detectedLanguageCode: string,
        text: string,
    }[]
}

interface OAuthResponseBody {
    iamToken: string,
    expiresAt: string,
}

/**
 * Запрос перевода текста через API сервис Яндекс Переводчик.
 * Требует ключ API и folderId.
 * Не уверен, но кажется требует чутка денег.
 */
export class YandexApi implements TranslateApi {

    protected oauthToken = '';
    protected iamToken = '';
    protected folderId = '';

    async setup(settings: WorkspaceConfiguration): Promise<void> {
        this.oauthToken = settings.get<string>('yandex.oauth-token') ?? '';
        this.folderId = settings.get<string>('yandex.folder-id') ?? '';

        // TODO: токены - в кеш на час складывать
        if (!this.iamToken) {
            await this.updateIAMToken();
        }
    }

    protected async updateIAMToken() {
        const responseBody = await (new Fetch()).request(
            {
                hostname: 'iam.api.cloud.yandex.net',
                port: 443,
                path: '/iam/v1/tokens',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            },
            JSON.stringify({
                yandexPassportOauthToken: this.oauthToken,
            }),
        );

        const jsonBody = <OAuthResponseBody>JSON.parse(responseBody);

        this.iamToken = jsonBody.iamToken;
    }

    async translate(
        textToTranslate: string,
        options: TranslateApiOptions,
    ): Promise<string> {

        if (!this.oauthToken) {
            throw new Error('YandexAPI: Ключ OAuth пустой!');
        }

        if (!this.iamToken) {
            throw new Error('YandexAPI: Не получилось получить токен для запроса перевода!');
        }

        const responseBody = await (new Fetch()).request(
            {
                hostname: 'translate.api.cloud.yandex.net',
                port: 443,
                path: '/translate/v2/translate',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.iamToken}`,
                    'Content-Type': 'application/json',
                },
            },
            JSON.stringify({
                folderId: this.folderId,
                texts: [ textToTranslate ],
                targetLanguageCode: options.toLangCode,
            }),
        );

        const jsonBody = <TranslateResponseBody>JSON.parse(responseBody);

        return jsonBody.translations.map(translate => translate.text).join('');
    }
}
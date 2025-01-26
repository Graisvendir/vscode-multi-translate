import { WorkspaceConfiguration } from 'vscode';
import { GoogleTranslateRequestV1 } from './translate-api/google-translate-v1';
import { TranslateApi, TranslateApiEnum, TranslateResult } from './translate-api/types';
import { DeeplApi } from './translate-api/deepl-api';

export class Translator {

    protected translateApiCode?: TranslateApiEnum;
    protected languages: string[];

    constructor(protected settings: WorkspaceConfiguration) {
        this.languages = settings.get<string>('languages-to-translate-into')
            ?.split(',')
            .map(lang => lang.trim()) ?? [];
        this.translateApiCode = settings.get<TranslateApiEnum>('translate-api');
    }

    async translateTextToMultipleLanguages(
        text: string,
    ): Promise<TranslateResult[]> {
        const translateApi = this.translateApiFabric();

        const promises = this.languages.map(lang => {
            return translateApi.translate(
                text,
                {
                    fromLangCode: 'ru', // TODO: это в настройку надо утащить
                    toLangCode: lang,
                },
            );
        });

        const resultTexts = await Promise.all(promises);

        return resultTexts.map((text, index) => {
            return {
                lang: this.languages[index],
                translatedText: text,
            };
        });
    }

    /**
     * Фабрика.
     * По коду переводчика отдаст объект переводчика.
     *
     * @param translateApiCode
     * @returns
     */
    protected translateApiFabric(): TranslateApi {
        if (!this.translateApiCode) {
            throw new Error('API перевода не задано!');
        }

        const apiMap = new Map<TranslateApiEnum, any>([
            [TranslateApiEnum.googleV1, GoogleTranslateRequestV1],
            [TranslateApiEnum.deepl, DeeplApi],
        ]);

        const apiClass = apiMap.get(this.translateApiCode);

        if (!apiClass) {
            throw new Error('Неопределенное API: ' + this.translateApiCode);
        }

        const api = new apiClass();

        api.applySettings(this.settings);

        return api;
    }
}

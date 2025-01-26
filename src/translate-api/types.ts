import { WorkspaceConfiguration } from "vscode";

export interface TranslateApiOptions {
    fromLangCode: string,
    toLangCode: string,
}

/**
 * Интерфейс для API перевода текста
 */
export interface TranslateApi {

    applySettings(settings: WorkspaceConfiguration): void;

    /**
     * Запрос на перевод текста
     *
     * @param textToTranslate текст, который будем переводить
     * @param fromLangCode с какого языка переводим. Символьный код
     * @param toLangCode на какой язык переводим. Символьный код
     */
    translate(
        textToTranslate: string,
        options: TranslateApiOptions,
    ): Promise<string>;
}

export enum TranslateApiEnum {
    googleV1 = 'google-v1',
    deepl = 'deepl',
}

export interface TranslateResult {
	lang: string,
	translatedText: string,
}
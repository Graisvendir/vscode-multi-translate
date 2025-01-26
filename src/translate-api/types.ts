
/**
 * Интерфейс для API перевода текста
 */
export interface TranslateApi {

    /**
     * Запрос на перевод текста
     *
     * @param testToTranslate текст, который будем переводить
     * @param fromLangCode с какого языка переводим. Символьный код
     * @param toLangCode на какой язык переводим. Символьный код
     */
    translate(
        testToTranslate: string,
        fromLangCode: string,
        toLangCode: string,
    ): Promise<string>;
}

export enum TranslateApiEnum {
    googleV1 = 'google-v1',
}

export interface TranslateResult {
	lang: string,
	translatedText: string,
}
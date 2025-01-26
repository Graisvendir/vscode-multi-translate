import { GoogleTranslateRequestV1 } from './translate-api/google-translate-v1';
import { TranslateApi, TranslateApiEnum, TranslateResult } from './translate-api/types';

/**
 * Фабрика.
 * По коду переводчика отдаст объект переводчика.
 *
 * @param translateApiCode
 * @returns
 */
function translateApiFabric(translateApiCode?: TranslateApiEnum): TranslateApi {
    if (!translateApiCode) {
        throw new Error('API перевода не задано!');
    }

    const apiMap = new Map([
        [TranslateApiEnum.googleV1, GoogleTranslateRequestV1],
    ]);

    const api = apiMap.get(translateApiCode);

    if (!api) {
        throw new Error('Неопределенное API: ' + translateApiCode);
    }

    return new api();
}


export async function translateTextToMultipleLanguages(
    text: string,
    targetLanguages: string[],
    translateApiCode?: TranslateApiEnum,
): Promise<TranslateResult[]> {
    console.log('translateText ', text, targetLanguages);

    const translateApi = translateApiFabric(translateApiCode);

    const promises = targetLanguages.map(lang => {
        return translateApi.translate(
            text,
            'ru', // TODO: это в настройку надо утащить
            lang,
        );
    });

    const resultTexts = await Promise.all(promises);

    return resultTexts.map((text, index) => {
        return {
            lang: targetLanguages[index],
            translatedText: text,
        };
    });
}
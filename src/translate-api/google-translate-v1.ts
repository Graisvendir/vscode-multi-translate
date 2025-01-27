import { WorkspaceConfiguration } from 'vscode';
import { Fetch } from '../fetch';
import { TranslateApi, TranslateApiOptions } from './types';

interface Sentence {
    trans: string;
}

interface ResponseJsonBody {
    sentences: Sentence[],
}

/**
 * Запрос перевода текста на язык через API версии 1.
 * Бесплатное. Не требует ключа API.
 * Работает, но в какой-то момент гугл может сказать, что я слишком много запрашиваю текста.
 * Нестабильный вариант.
 */
export class GoogleTranslateRequestV1 implements TranslateApi {

    private languageMap = {
        "auto": "Automatic",
        "af": "Afrikaans",
        "sq": "Albanian",
        "am": "Amharic",
        "ar": "Arabic",
        "hy": "Armenian",
        "az": "Azerbaijani",
        "eu": "Basque",
        "be": "Belarusian",
        "bn": "Bengali",
        "bs": "Bosnian",
        "bg": "Bulgarian",
        "ca": "Catalan",
        "ceb": "Cebuano",
        "ny": "Chichewa",
        "zh-cn": "Chinese Simplified",
        "zh-tw": "Chinese Traditional",
        "co": "Corsican",
        "hr": "Croatian",
        "cs": "Czech",
        "da": "Danish",
        "nl": "Dutch",
        "en": "English",
        "eo": "Esperanto",
        "et": "Estonian",
        "tl": "Filipino",
        "fi": "Finnish",
        "fr": "French",
        "fy": "Frisian",
        "gl": "Galician",
        "ka": "Georgian",
        "de": "German",
        "el": "Greek",
        "gu": "Gujarati",
        "ht": "Haitian Creole",
        "ha": "Hausa",
        "haw": "Hawaiian",
        "iw": "Hebrew",
        "hi": "Hindi",
        "hmn": "Hmong",
        "hu": "Hungarian",
        "is": "Icelandic",
        "ig": "Igbo",
        "id": "Indonesian",
        "ga": "Irish",
        "it": "Italian",
        "ja": "Japanese",
        "jw": "Javanese",
        "kn": "Kannada",
        "kk": "Kazakh",
        "km": "Khmer",
        "ko": "Korean",
        "ku": "Kurdish (Kurmanji)",
        "ky": "Kyrgyz",
        "lo": "Lao",
        "la": "Latin",
        "lv": "Latvian",
        "lt": "Lithuanian",
        "lb": "Luxembourgish",
        "mk": "Macedonian",
        "mg": "Malagasy",
        "ms": "Malay",
        "ml": "Malayalam",
        "mt": "Maltese",
        "mi": "Maori",
        "mr": "Marathi",
        "mn": "Mongolian",
        "my": "Myanmar (Burmese)",
        "ne": "Nepali",
        "no": "Norwegian",
        "ps": "Pashto",
        "fa": "Persian",
        "pl": "Polish",
        "pt": "Portuguese",
        "pa": "Punjabi",
        "ro": "Romanian",
        "ru": "Russian",
        "sm": "Samoan",
        "gd": "Scots Gaelic",
        "sr": "Serbian",
        "st": "Sesotho",
        "sn": "Shona",
        "sd": "Sindhi",
        "si": "Sinhala",
        "sk": "Slovak",
        "sl": "Slovenian",
        "so": "Somali",
        "es": "Spanish",
        "su": "Sundanese",
        "sw": "Swahili",
        "sv": "Swedish",
        "tg": "Tajik",
        "ta": "Tamil",
        "te": "Telugu",
        "th": "Thai",
        "tr": "Turkish",
        "uk": "Ukrainian",
        "ur": "Urdu",
        "uz": "Uzbek",
        "vi": "Vietnamese",
        "cy": "Welsh",
        "xh": "Xhosa",
        "yi": "Yiddish",
        "yo": "Yoruba",
        "zu": "Zulu"
    };

    async setup(settings: WorkspaceConfiguration): Promise<void> {
    }

    public async translate(
        text: string,
        options: TranslateApiOptions,
    ): Promise<string> {
        [ options.fromLangCode, options.toLangCode ].forEach((lang) => {
            if (!this.isLanguageSupported(lang)) {
                throw new Error(`Язык '${lang}' не поддерживается.`);
            }
        });

        const from = this.getISOCode(options.fromLangCode);
        const to = this.getISOCode(options.toLangCode);

        const requestPath = '/translate_a/single'
            + '?client=at'
            + '&dt=t'
            + '&dt=ld'
            + '&dt=qca'
            + '&dt=rm'
            + '&dt=bd'
            + '&dj=1'
            + '&hl=uk-RU'
            + '&ie=UTF-8'
            + '&oe=UTF-8'
            + '&inputm=2'
            + '&otf=2'
            + '&sl=' + from
            + '&tl=' + to
            + '&hl=' + to
            ;

        const responseBody = await (new Fetch()).request(
            {
                hostname: 'translate.google.com',
                port: 443,
                path: requestPath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                },
            },
            new URLSearchParams({ q: text }).toString(),
        );

        const jsonBody = <ResponseJsonBody>JSON.parse(responseBody);

        return jsonBody.sentences
            .map(sentence => sentence.trans)
            .join('');
    }

    /**
     * Returns the ISO 639-1 code of the desiredLang – if it is supported by
     * Google Translate
     * @param {string} language The name or the code of the desired language
     * @returns {string|boolean} The ISO 639-1 code of the language or null if the
     * language is not supported
     */
    protected getISOCode(language: string): string | null {
        language = language.toLowerCase();

        if (language in this.languageMap) {
            return language;
        }

        let keys = Object.keys(this.languageMap).filter(key => {
            // @ts-ignore
            return languages[key].toLowerCase() === language;
        });

        return keys[0] || null;
    }

    /**
     * Returns true if the desiredLang is supported by Google Translate and false otherwise
     * @param {String} languageCode The ISO 639-1 code or the name of the desired language.
     * @returns {boolean} If the language is supported or not.
     */
    protected isLanguageSupported(languageCode: string): boolean {
        return Boolean(this.getISOCode(languageCode));
    }
}

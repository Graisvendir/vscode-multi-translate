import * as https from 'https';
import { Fetch } from './fetch';

interface Options {
    from: string;
    to: string;
}

interface Sentence {
    trans: string;
}

interface ResponseJsonBody {
    sentences: Sentence[],
}

/**
 * Запрос перевода текста на язык через API версии 1.
 * Бесплатное. Не требует ключа API
 */
export class GoogleTranslateRequestV1 {

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

    public async translate(text: string, options: Options): Promise<string> {
        [ options.from, options.to ].forEach((lang) => {
            if (!this.isLanguageSupported(lang)) {
                throw new Error(`Язык '${lang}' не поддерживается.`);
            }
        });

        const from = this.getISOCode(options.from);
        const to = this.getISOCode(options.to);

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



function getToken(a: string) {
    var b = 406644;
    var b1 = 3293161072;

    var jd = ".";
    var $b = "+-a^+6";
    var Zb = "+-3^+b+-f";

    for (var e: number[] = [], f = 0, g = 0; g < a.length; g++) {
      var m = a.charCodeAt(g);
      128 > m
        ? (e[f++] = m)
        : (2048 > m
            ? (e[f++] = (m >> 6) | 192)
            : (55296 == (m & 64512) &&
              g + 1 < a.length &&
              56320 == (a.charCodeAt(g + 1) & 64512)
                ? ((m = 65536 + ((m & 1023) << 10) + (a.charCodeAt(++g) & 1023)),
                  (e[f++] = (m >> 18) | 240),
                  (e[f++] = ((m >> 12) & 63) | 128))
                : (e[f++] = (m >> 12) | 224),
              (e[f++] = ((m >> 6) & 63) | 128)),
          (e[f++] = (m & 63) | 128));
    }
    var c = b;
    for (f = 0; f < e.length; f++) (c += e[f]), (c = RL(c, $b));
    c = RL(c, Zb);
    c ^= b1 || 0;
    0 > c && (c = (c & 2147483647) + 2147483648);
    c %= 1e6;
    return c.toString() + jd + (c ^ b);
}

function RL(a: number, b: string) {
    var t = "a";
    var Yb = "+";
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        var e = d >= t ? d.charCodeAt(0) - 87 : Number(d);
        var f = b.charAt(c + 1) == Yb ? a >>> e : a << e;
        a = b.charAt(c) == Yb ? (a + f) & 4294967295 : a ^ f;
    }
    return a;
}

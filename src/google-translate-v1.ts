import * as https from 'https';
import { Fetch } from './fetch';

interface Options {
    from: string;
    to: string;
}

export async function translate(text: string, options: Options) {
    text = String(text);

    // Check if a lanugage is in supported; if not, throw an error object.
    let error;
    [ options.from, options.to ].forEach((lang) => {
        if (lang && !isSupported(lang)) {
            error = new Error();
            error.message = `The language '${lang}' is not supported.`;
        }
    });
    if (error) throw error;

    // If options object doesn"t have "from" language, set it to "auto".
    if (!Object.prototype.hasOwnProperty.call(options, "from")) options.from = "auto";
    // If options object doesn"t have "to" language, set it to "en".
    if (!Object.prototype.hasOwnProperty.call(options, "to")) options.to = "en";

    // Get ISO 639-1 codes for the languages.
    const from = getISOCode(options.from);
    const to = getISOCode(options.to);

    // Generate Google Translate token for the text to be translated.
    let token = getToken(text);

    // URL & query string required by Google Translate.
    // $url = 'https://translate.google.com/translate_a/single?client=at&dt=t&dt=ld&dt=qca&dt=rm&dt=bd&dj=1&hl=uk-RU&ie=UTF-8&oe=UTF-8&inputm=2&otf=2&iid=1dd3b944-fa62-4b55-b330-74909a99969e';
    let path = '/translate_a/single'
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
        // + '&q=' + encodeURIComponent(text)
        // + '&iid=1dd3b944-fa62-4b55-b330-74909a99969e'
        ;

    // let data = {
    //     client: "gtx",
    //     sl: options.from,
    //     tl: options.to,
    //     hl: options.to,
    //     dt: [ "at", "bd", "ex", "ld", "md", "qca", "rw", "rm", "ss", "t" ],
    //     ie: "UTF-8",
    //     oe: "UTF-8",
    //     otf: 1,
    //     ssel: 0,
    //     tsel: 0,
    //     kc: 7,
    //     q: text,
    //     tk: token,
    // };

    // Append query string to the request URL.
    // let url = `${baseUrl}?${encodeURIComponent(data)}`;

    const responseBody = await (new Fetch()).request(
        {
            hostname: 'translate.google.com',
            port: 443,
            path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
                // 'Content-Length': 0,
            },
        },
        new URLSearchParams({ q: text }).toString(),
    );

    const jsonBody = JSON.parse(responseBody);

    let finishText = '';

    // @ts-ignore
    jsonBody.sentences.forEach(item => {
        finishText += item.trans;
    });

    console.log('!!!!!!! json', finishText, responseBody, jsonBody); // TODO: console.log remove

    return finishText;
}


const languages = {
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

/**
 * Returns the ISO 639-1 code of the desiredLang – if it is supported by
 * Google Translate
 * @param {string} language The name or the code of the desired language
 * @returns {string|boolean} The ISO 639-1 code of the language or null if the
 * language is not supported
 */
function getISOCode(language: string) {
    if (!language) return false;

    language = language.toLowerCase();
    if (language in languages) return language;

    let keys = Object.keys(languages).filter((key) => {

        // if (typeof languages[key] !== "string") return false;
        // @ts-ignore
        return languages[key].toLowerCase() === language;
    });

    return keys[0] || null;
}

/**
 * Returns true if the desiredLang is supported by Google Translate and false otherwise
 * @param {String} language The ISO 639-1 code or the name of the desired language.
 * @returns {boolean} If the language is supported or not.
 */
function isSupported(language: string) {
    return Boolean(getISOCode(language));
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

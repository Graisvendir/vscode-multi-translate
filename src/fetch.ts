import { IncomingMessage } from 'http';
import * as https from 'https';

/**
 * Отправитель http запроса.
 * Делает это через async/await, а не через колбэки.
 * А то встроенный пакет https только через колбэки может.
 */
export class Fetch {

    /**
     * Отправит запрос по переданным параметрам
     *
     * @param options опции запроса
     * @param body тело запроса
     * @returns тело ответа на запрос
     */
    public request(options: https.RequestOptions, body?: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const request = https.request(
                options,
                (result: IncomingMessage) => {
                    let responseBody = '';

                    result.on('data', (chunk) => {
                        responseBody += chunk;
                    });

                    result.on('end', () => {
                        resolve(responseBody);
                    });
                },
            );

            request.on('error', error => {
                console.log('error', error); // TODO: console.log remove
                reject(error);
            });

            request.write(body);

            // Отправка данных
            request.end();
        });
    }

}
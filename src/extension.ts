// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import { connect } from 'http2';
import * as vscode from 'vscode';
// import { } from 'node:net';
import * as https from 'https';

interface TranslateResult {
	lang: string,
	translatedText: string,
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	async function translateText(text: string, targetLanguages: string[]): Promise<TranslateResult[]> {
		console.log('translateText ', text, targetLanguages);

		// Пример: простой перевод (замените на вызов реального API перевода)
		const promiseList = targetLanguages.map(lang => {
			const options: https.RequestOptions = {
				hostname: 'translation.googleapis.com',
				port: 443,
				path: `/language/translate/v2?q=${text}&source=ru&target=${lang}`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Content-Length': 0,
				},
			};

			return new Promise<TranslateResult>((resolve, reject) => {
				const request = https.request(options, result => {
					let translatedText = '';
					console.log('!!!!!!! 1', ); // TODO: console.log remove

					result.on('data', (chunk) => {
						console.log('!!!!!!! 2', ); // TODO: console.log remove
						translatedText += chunk;
					});

					result.on('end', () => {
						// vscode.window.showInformationMessage(`Response: ${response}`);
						resolve({
							lang,
							translatedText,
						});
					});
				});

				request.on('error', error => {
					console.error(error.message);
					vscode.window.showInformationMessage(`Обосрались на запросе ${lang}:(`);
					reject(error);
				});

				// Отправка данных
				// request.write(data);
				request.end();
			});
		});


		return await Promise.all(promiseList);

		// return translates.map(translate => ());
		// return {
		// 	lang,
		// 	text: `[Translated to ${lang}]: ${text}`
		// };
	}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "multi-translate" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('multi-translate.multiTranslateString', async () => {
		const editor = vscode.window.activeTextEditor;

        if (!editor) {
            vscode.window.showErrorMessage('No active text editor found.');
			console.error('No active text editor found');
			return;
        }

		// Получение выделенного текста
        const selectedText = editor.document.getText(editor.selection);
        if (!selectedText) {
			console.error('No selected text');
            vscode.window.showErrorMessage('Select any text!');
            return;
        }

		// Пример перевода текста (замените на реальный API перевода)
        const translations = await translateText(selectedText, ['en', 'es', 'fr']); // Пример языков

        // Форматирование перевода для вывода
        const formattedTranslations = translations
            .map(({ lang, translatedText }) => `${lang.toUpperCase()}:\n${translatedText}`)
            .join('\n\n');

        // Создание нового документа и вывод текста
        const newDoc = await vscode.workspace.openTextDocument({ content: formattedTranslations });
        await vscode.window.showTextDocument(newDoc);

	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

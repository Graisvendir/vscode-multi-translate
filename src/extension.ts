import * as vscode from 'vscode';
import { GoogleTranslateRequestV1 } from './google-translate-v1';

interface TranslateResult {
	lang: string,
	translatedText: string,
}

export function activate(context: vscode.ExtensionContext) {

    async function translateText(text: string, targetLanguages: string[]): Promise<TranslateResult[]> {
        console.log('translateText ', text, targetLanguages);

        const googleTranslate = new GoogleTranslateRequestV1();

        const promises = targetLanguages.map(lang => {
            return googleTranslate.translate(
                text,
                {
                    from: 'ru',
                    to: lang,
                }
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


    const disposable = vscode.commands.registerCommand('multi-translate.multi-translate-selected-text', async () => {
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

        const settings = vscode.workspace.getConfiguration('multi-translate');

        const languages = settings.get<string>('languages-to-translate-into')
            ?.split(',')
            .map(lang => lang.trim()) ?? [];

        const translations = await translateText(selectedText, languages); // Пример языков

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

export function deactivate() { }

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import { connect } from 'http2';
import * as vscode from 'vscode';
import { GoogleTranslateRequest, TranslateResult } from './google-translate-request';

export function activate(context: vscode.ExtensionContext) {

    async function translateText(text: string, targetLanguages: string[]): Promise<TranslateResult[]> {
        console.log('translateText ', text, targetLanguages);

        const translater = new GoogleTranslateRequest();

        return translater.multiTranslate(text, targetLanguages);
    }


    const disposable = vscode.commands.registerCommand('multitranslate.multiTranslateString', async () => {
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

export function deactivate() { }

import * as vscode from 'vscode';
import { translateTextToMultipleLanguages } from './translate-text';
import { TranslateApiEnum } from './translate-api/types';

export function activate(context: vscode.ExtensionContext) {

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

        const translateApiCode = settings.get<TranslateApiEnum>('translate-api');

        const translations = await translateTextToMultipleLanguages(
            selectedText,
            languages,
            translateApiCode,
        );

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

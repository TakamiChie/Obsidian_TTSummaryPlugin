import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';

// Remember to rename these classes and interfaces!

interface TTSummaryPluginSettings {
	api_token: string;
}

const DEFAULT_SETTINGS: TTSummaryPluginSettings = {
	api_token: ''
}

export default class TTSummaryPlugin extends Plugin {
	settings: TTSummaryPluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'aggregate-weekly',
			name: 'Aggregate: Weekly',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection());
				editor.replaceSelection('Sample Editor Command');
			}
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingTab extends PluginSettingTab {
	plugin: TTSummaryPlugin;

	constructor(app: App, plugin: TTSummaryPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'API settings'});

		new Setting(containerEl)
			.setName('API Token')
			.setDesc('Enter the API token of Toggl Track')
			.addText(text => text
				.setValue(this.plugin.settings.api_token)
				.onChange(async (value) => {
					this.plugin.settings.api_token = value;
					await this.plugin.saveSettings();
				}));
	}
}

import { Editor, MarkdownView, Notice, Plugin } from 'obsidian';
import { formatDate, mySetIntervalFunction } from './helpers';
import { DEFAULT_SETTINGS, SampleSettingTab } from './settings';
import { MyPluginSettings } from './types';
import { SampleModal } from './ui';

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings = DEFAULT_SETTINGS;
    pluginName: string = 'Obsidian Mini Plugins';

    async onload() {
        console.log(`Loading plugin: ${this.pluginName} at [${formatDate()}]`);

        await this.loadSettings();

        // This creates an icon in the left ribbon.
        // Icon options I like alarm-clock, alarm-plus, bell-plus... see here: https://lucide.dev/
        const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', (evt: MouseEvent) => {
            // Called when the user clicks the icon.
            new Notice('This is a notice!');
        });
        // Perform additional things with the ribbon
        ribbonIconEl.addClass('my-plugin-ribbon-class');

        // This adds a status bar item to the bottom of the app. Does not work on mobile apps.
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: `open-sample-modal-${this.pluginName.replace(/\s/g, '-')}`,
            name: `Open sample modal for ${this.pluginName}`,
            callback: () => {
                new SampleModal(this.app).open();
            }
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    onunload() {
        console.log(`Unloading plugin: ${this.pluginName} at [${formatDate()}]`);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

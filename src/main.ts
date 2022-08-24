import { Editor, MarkdownView, Notice, Plugin, TFile, TFolder } from 'obsidian';
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

        this.app.workspace.onLayoutReady(async () => {
            //console.log("Layout ready");
            // This adds a settings tab so the user can configure various aspects of the plugin
            this.addSettingTab(new SampleSettingTab(this.app, this));

            const folderPathStr = "mini-plugins";
            let currentSnippets = this.settings.MyConfigSettings.mySnippets;
            //console.log(currentSnippets);
            for (const eachProp in currentSnippets) {
                if (currentSnippets[eachProp] === true) {
                    //console.log(`${eachProp} is set to be loaded`);
                    const tFileObject = this.app.vault.getAbstractFileByPath(`${folderPathStr}/${eachProp}.md`);
                    if (tFileObject instanceof TFile) {
                        //console.log(`Found file: ${tFileObject.basename}`);
                        const fileContent = await this.app.vault.read(tFileObject);
                        // remove code block back ticks from start and end of file content string
                        let codeBlockStr = fileContent;
                        const codeBlockWithoutBackticks = codeBlockStr.match(/^\`\`\`.*\n([\s\S]*)\n\`\`\`$/);
                        if (codeBlockWithoutBackticks) { codeBlockStr = codeBlockWithoutBackticks[1] }
                        //console.log(codeBlockStr);
                        Function("thisPlugin", codeBlockStr)(this);
                        console.log(`Loaded plugin snippet: '${eachProp}' with the following code:\n${codeBlockStr}`);
                        new Notice(`Loaded plugin snippet: '${eachProp}'`, 20000);
                    } else {
                        console.log(`${eachProp} file not found`);
                    }
                } else {
                    console.log(`**** ${eachProp} will NOT be loaded`);
                }
            }

            // Re-open the settings tab for my plugin
            const settingsWindow = document.querySelector('.modal.mod-settings');
            if (settingsWindow) {
                const settingsTabs = settingsWindow.querySelectorAll('.vertical-tab-nav-item') as NodeListOf<HTMLElement>;
                if (settingsTabs) {
                    Array.from(settingsTabs).forEach(tab => {
                        if (tab.textContent === this.manifest.name) {
                            tab.click();
                        }
                    });
                }
            }
        });
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

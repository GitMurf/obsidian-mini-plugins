import { App, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
import { sleepDelay } from './helpers';
import MyPlugin from './main';
import { MyPluginSettings } from './types';

export const DEFAULT_SETTINGS: MyPluginSettings = {
    MyConfigSettings: {
        mySnippets: {}
    },
}

export class SampleSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    async display(): Promise<void> {
        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'Mini Plugin Snippets' });

        // Add a refresh button to reload all snippets
        const refreshButton = containerEl.createEl('button', { text: 'Refresh' });
        refreshButton.onClickEvent(async() => {
            await this.reloadPlugin();
        });
        containerEl.createEl('br');
        containerEl.createEl('br');

        let currentSnippets = this.plugin.settings.MyConfigSettings.mySnippets;
        //console.log(currentSnippets);
        const folderPathStr = "mini-plugins";
        const tFolderObject = this.app.vault.getAbstractFileByPath(folderPathStr);
        let foundFiles: string[] = [];
        if (tFolderObject instanceof TFolder) {
            tFolderObject.children.forEach(async (tFileObject) => {
                if (tFileObject instanceof TFile) {
                    //console.log(`Found file: ${tFileObject.basename}`);
                    foundFiles.push(tFileObject.basename);
                    let thisSnippet = currentSnippets[tFileObject.basename];
                    if (thisSnippet === undefined) {
                        console.log(`'${tFileObject.basename}' Snippet not found... adding it to the Settings list`);
                        currentSnippets[tFileObject.basename] = false;
                        thisSnippet = false;
                    }

                    let newSetting = new Setting(containerEl);
                    newSetting.setName(tFileObject.basename.replace(/^mini\-plugins\./, ''));
                    newSetting.addToggle(toggleComp => {
                        toggleComp.setValue(thisSnippet);
                        toggleComp.onChange(async (value) => {
                            //console.log(`${tFileObject.basename}: ${value}`);
                            currentSnippets[tFileObject.basename] = value;
                            await this.reloadPlugin();
                        });
                    });
                }
            });
        } else {
            console.log("Folder not found");
        }
        for (const eachProp in currentSnippets) {
            if (!foundFiles.includes(eachProp)) {
                console.log(`${eachProp} not found in folder... deleting it from Settings list`);
                delete currentSnippets[eachProp];
            }
        }
        await this.plugin.saveSettings();
    }

    async reloadPlugin() {
        console.log(`Manually reloading plugin: ${this.plugin.pluginName}`);
        await this.plugin.saveSettings();
        this.plugin.unload();
        await sleepDelay(this.plugin, 1);
        this.plugin.load();
    }
}

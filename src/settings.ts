import { App, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
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
        refreshButton.onClickEvent(async () => {
            await this.reloadPlugin();
        });
        containerEl.createEl('br');
        containerEl.createEl('br');

        let currentSnippets = this.plugin.settings.MyConfigSettings.mySnippets;
        //console.log(currentSnippets);
        const folderPathStr = "mini-plugins";
        const tFolderObject = this.app.vault.getAbstractFileByPath(folderPathStr);
        let foundFiles: string[] = [];
        let listUpdated = false;
        if (tFolderObject instanceof TFolder) {
            tFolderObject.children.forEach(async (tFileObject) => {
                if (tFileObject instanceof TFile) {
                    //console.log(`Found file: ${tFileObject.basename}`);
                    // Archive files so they are not shown in the list
                    if (tFileObject.basename.startsWith("archive.")) { return };
                    foundFiles.push(tFileObject.basename);
                    let thisSnippet = currentSnippets[tFileObject.basename];
                    if (thisSnippet === undefined) {
                        console.log(`'${tFileObject.basename}' Snippet not found... adding it to the Settings list`);
                        currentSnippets[tFileObject.basename] = false;
                        thisSnippet = false;
                        listUpdated = true;
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
        let needToReload = false;
        for (const eachProp in currentSnippets) {
            if (!foundFiles.includes(eachProp)) {
                console.log(`'${eachProp}' not found in folder... deleting it from Settings list`);
                delete currentSnippets[eachProp];
                needToReload = true;
            }
        }

        if (needToReload) {
            await this.reloadPlugin();
        } else if (listUpdated) {
            await this.plugin.saveSettings();
        }
    }

    async reloadPlugin() {
        console.log(`Manually reloading plugin: ${this.plugin.pluginName}`);
        await this.plugin.saveSettings();
        const pluginId = this.plugin.manifest.id;
        // Licat recommended using disable/enable instead of unload/load
        await app.plugins.disablePlugin(pluginId);
        await app.plugins.enablePlugin(pluginId);
    }
}

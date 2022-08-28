import { App, PluginSettingTab, Setting, TFile, TFolder } from 'obsidian';
import MyPlugin from './main';
import { MyPluginSettings } from './types';

export const DEFAULT_SETTINGS: MyPluginSettings = {
    MyConfigSettings: {
        mySnippets: {},
        myFunctions: {},
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

        containerEl.createEl('h2', { text: 'Mini Plugin Settings' });

        // Add a refresh button to reload all snippets
        const refreshButton = containerEl.createEl('button', { text: 'Refresh' });
        refreshButton.onClickEvent(async () => {
            await this.reloadPlugin();
        });
        containerEl.createEl('br');
        containerEl.createEl('br');

        containerEl.createEl('h3', { text: 'Mini Plugin Snippets' });

        let currentSnippets = this.plugin.settings.MyConfigSettings.mySnippets;
        //console.log(currentSnippets);
        const folderPathStr = "mini-plugins";
        let tFolderObject = this.app.vault.getAbstractFileByPath(folderPathStr);
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

        containerEl.createEl('h3', { text: 'Mini Plugin Functions' });

        let currentFunctions = this.plugin.settings.MyConfigSettings.myFunctions;
        //console.log(currentFunctions);
        const funcFolderPath = `${folderPathStr}/functions`;
        tFolderObject = this.app.vault.getAbstractFileByPath(funcFolderPath);
        let foundFuncFiles: string[] = [];
        let funcListUpdated = false;
        if (tFolderObject instanceof TFolder) {
            tFolderObject.children.forEach(async (tFileObject) => {
                if (tFileObject instanceof TFile) {
                    //console.log(`Found file: ${tFileObject.basename}`);
                    // Archive files so they are not shown in the list
                    if (tFileObject.basename.startsWith("archive.")) { return };
                    foundFuncFiles.push(tFileObject.basename);
                    let thisSnippet = currentFunctions[tFileObject.basename];
                    if (thisSnippet === undefined) {
                        console.log(`'${tFileObject.basename}' [FUNCTION] Snippet not found... adding it to the Settings list`);
                        currentFunctions[tFileObject.basename] = false;
                        thisSnippet = false;
                        funcListUpdated = true;
                    }

                    let newSetting = new Setting(containerEl);
                    newSetting.setName(tFileObject.basename.replace(/^mini\-plugins\.function\./, ''));
                    newSetting.addToggle(toggleComp => {
                        toggleComp.setValue(thisSnippet);
                        toggleComp.onChange(async (value) => {
                            //console.log(`${tFileObject.basename}: ${value}`);
                            currentFunctions[tFileObject.basename] = value;
                            await this.reloadPlugin();
                        });
                    });
                }
            });
        } else {
            console.log("Folder not found");
        }

        containerEl.createEl('h4', { text: 'Declared Function Names' });
        const funcParentDiv = containerEl.createDiv();
        let ctr = 0;
        for (const eachProp in this.plugin.miniPlugins.functions) {
            ctr++;
            let myString = `${eachProp}()`;
            if (ctr > 1) { myString = `, ${myString}`; }
            funcParentDiv.createSpan({ text: myString });
        }
        containerEl.createEl('br');
        containerEl.createEl('br');

        let needToReload = false;
        for (const eachProp in currentSnippets) {
            if (!foundFiles.includes(eachProp)) {
                console.log(`'${eachProp}' not found in [PLUGIN] folder... deleting it from Settings list`);
                delete currentSnippets[eachProp];
                needToReload = true;
            }
        }
        for (const eachProp in currentFunctions) {
            if (!foundFuncFiles.includes(eachProp)) {
                console.log(`'${eachProp}' not found in [FUNCTION] folder... deleting it from Settings list`);
                delete currentFunctions[eachProp];
                needToReload = true;
            }
        }

        if (needToReload) {
            await this.reloadPlugin();
        } else if (listUpdated || funcListUpdated) {
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

//META{"name":"HideableSpoilers","displayName":"HideableSpoilers","website":"https://github.com/KanTheAstronaut/BD-Plugins","source":"https://raw.githubusercontent.com/KanTheAstronaut/BD-Plugins/master/HideableSpoilers.plugin.js"}*//
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

var HideableSpoilers = (() => {
    const config = {
      info: {
        name: "HideableSpoilers",
        authors: [
          {
            name: "KanTheAstronaut",
            discord_id: "908757358199570433",
            github_username: "KanTheAstronaut",
          },
        ],
        version: "0.0.1",
        description: "Allows you to hide spoilers again after revealing them.\nDefault rehide key: CTRL (+ left click)",
        github: "https://github.com/KanTheAstronaut/BD-Plugins",
        github_raw:
          "https://raw.githubusercontent.com/KanTheAstronaut/BD-Plugins/master/HideableSpoilers.plugin.js",
      }
    };
  
    return !global.ZeresPluginLibrary
      ? class {
          constructor() {
            this._config = config;
          }
          getName() {
            return config.info.name;
          }
          getAuthor() {
            return config.info.authors.map((a) => a.name).join(", ");
          }
          getDescription() {
            return config.info.description;
          }
          getVersion() {
            return config.info.version;
          }
          load() {
            const title = "Library Missing";
            const ModalStack = BdApi.findModuleByProps(
              "push",
              "update",
              "pop",
              "popWithKey"
            );
            const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
            const ConfirmationModal = BdApi.findModule(
              (m) => m.defaultProps && m.key && m.key() == "confirm-modal"
            );
            if (!ModalStack || !ConfirmationModal || !TextElement)
              return BdApi.alert(
                title,
                `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`
              );
            ModalStack.push(function (props) {
              return BdApi.React.createElement(
                ConfirmationModal,
                Object.assign(
                  {
                    header: title,
                    children: [
                      BdApi.React.createElement(TextElement, {
                        color: TextElement.Colors.PRIMARY,
                        children: [
                          `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                        ],
                      }),
                    ],
                    red: false,
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                      require("request").get(
                        "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                        async (error, response, body) => {
                          if (error)
                            return require("electron").shell.openExternal(
                              "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                            );
                          await new Promise((r) =>
                            require("fs").writeFile(
                              require("path").join(
                                ContentManager.pluginsFolder,
                                "0PluginLibrary.plugin.js"
                              ),
                              body,
                              r
                            )
                          );
                        }
                      );
                    },
                  },
                  props
                )
              );
            });
          }
          start() {}
          stop() {}
        }
      : (([Plugin, Api]) => {
          const plugin = (Plugin, Library) => {
  
            //#region constants
            const { WebpackModules, Settings } =
              Library;
              const SRender = WebpackModules.findByDisplayName("Spoiler").prototype;
              const SClass = BdApi.findModuleByProps("spoilerText");
              const KTranslate = BdApi.findModuleByProps(["keyToCode"]);
            //#endregion

            class SpoilerContainer extends BdApi.React.Component {

                async componentDidMount() {
                  this.setState({ interior: this.props.interior, settings: this.props.settings, pressedKeys: [] });
                }
                
                revealSpoiler(t) {
                    t.classList.remove(SClass.hidden);
                    t.setAttribute("tabindex", "-1");
                    t.setAttribute("role", "presentation");
                    t.setAttribute("aria-expanded", "true");
                    t.removeAttribute("aria-label");
                    t.firstChild.setAttribute("aria-hidden", "false");
                }

                hideSpoiler(m) {
                    var t = m.parentElement;
                    t.classList.add(SClass.hidden);
                    t.setAttribute("tabindex", "0");
                    t.setAttribute("role", "button");
                    t.setAttribute("aria-expanded", "false");
                    t.setAttribute("aria-label", "Spoiler");
                    m.setAttribute("aria-hidden", "true");
                }

                onToggle(e) {
                    if (e.target.className.includes("spoilerText"))
                        this.revealSpoiler(e.target);
                    else if (this.state.settings.requiredKeys.map(KTranslate.getString).sort().toString() == this.state.pressedKeys.sort().toString()) this.hideSpoiler(e.target);
                }

                render() {
                  return (this.state?.interior == null ? null : BdApi.React.createElement("span", {
                    onClick: (e) => {this.onToggle(e)}, onKeyDown: (e) => {
                        var mapped = KTranslate.getString(e.keyCode);
                        if (this.state.pressedKeys.includes(mapped))
                            return;
                        this.setState({ interior: this.state.interior, settings: this.state.settings, pressedKeys: [...this.state.pressedKeys, mapped] });
                        e.preventDefault();
                        e.stopPropagation();
                    }, onKeyUp: (e) => {
                        var mapped = KTranslate.getString(e.keyCode);
                        if (!this.state.pressedKeys.includes(mapped))
                            return;
                        this.setState({ interior: this.state.interior, settings: this.state.settings, pressedKeys: this.state.pressedKeys.filter(function(v) { return v != mapped })});
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }, this.state.interior));
                }
            }

            return class HideableSpoilers extends Plugin {
              constructor() {
                super();
                this.defaultSettings = {
                    requiredKeys: [162]
                };
              }
  
              onStart() {
                BdApi.Patcher.instead("HideableSpoilers", SRender, "renderSpoilerText", (a, _, original) => {
                    a.setState({visible: true});
                    return BdApi.React.createElement(SpoilerContainer, {
                        interior: original(), settings: this.settings
                      });
                });
              }
  
              onStop() {
                BdApi.Patcher.unpatchAll("HideableSpoilers");
              }

              getSettingsPanel() {
                return Settings.SettingPanel.build(
                  this.saveSettings.bind(this),
                  new Settings.SettingGroup("", {
                    collapsible: false,
                    shown: true,
                  }).append(new Settings.Keybind("Hide Key", "The keys to be pressed while clicking on a revealed spoiler in order to rehide it", this.settings.requiredKeys, (e) => {
                        this.settings.requiredKeys = e;
                    })
                  ));
              }
            };
          };
          return plugin(Plugin, Api);
        })(global.ZeresPluginLibrary.buildPlugin(config));
  })();
  /*@end@*/
  

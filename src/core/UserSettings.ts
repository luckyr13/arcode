import { Settings } from './interfaces/Settings';

export class UserSettings {
	private _settings: Settings = { lang: 'en', theme: 'dark-blue'};
	private _menuThemes: any = {
		'': {
      primary: '#FEFEFF',
      secondary: '#F1F0F1',
      tertiary: '#CDE8FE',
      textColor: '#000000'
		},
		'theme-dark': {
      primary: '#252526',
      secondary: '#252526',
      tertiary: '#084671',
      textColor: '#CDCCCD'
    },
		'dark-blue': {
      primary: '#001B48',
      secondary: '#02457a',
      tertiary: '#018abe',
      textColor: '#fff'
    }
	}

	public get settings() : Settings {
		return this._settings;
	}
	public set settings(v : Settings) {
		this._settings = v;
	}
	public get menuTheme() {
		return this._menuThemes[this._settings.theme];
	}
	
}

import { Settings } from './interfaces/Settings';

interface ThemeColor {
	primary: string,
	secondary: string,
	tertiary: string,
	textColor: string
}

export class UserSettings {
	private _settings: Settings = { lang: 'en', theme: 'theme-dark'};
	private _menuThemes: Record<string, ThemeColor> = {
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
	public get menuTheme(): ThemeColor {
		return this._menuThemes[this._settings.theme];
	}
	public get themes(): Record<string, ThemeColor> {
		return this._menuThemes;
	}

	public setAppTheme(theme: string) {
		if (!Object.prototype.hasOwnProperty.call(this._menuThemes, theme)) {
			throw Error('Wrong theme!');
		}
		const body = document.getElementsByTagName('body')[0];
		body.className = theme;
		this._settings.theme = theme;
	}
	
}

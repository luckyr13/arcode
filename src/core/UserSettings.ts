import { Settings } from './interfaces/Settings';

interface ThemeColor {
	primary: string,
	secondary: string,
	tertiary: string,
	textColor: string
}

export class UserSettings {
	private _settings: Settings;
	private _storage = window.localStorage;
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

	constructor() {
		this._settings = {
			lang: 'en',
			theme: '',
			stayLoggedIn: false
		}
		if (this._storage.getItem('settings')) {
			this._settings = JSON.parse(this._storage.getItem('settings')!);
		}
	}

	public get settings() : Settings {
		return this._settings;
	}
	public set settings(v : Settings) {
		this._storage.setItem('settings', JSON.stringify(v));
		this._settings = v;
	}
	public get menuTheme(): ThemeColor {
		return this._menuThemes[this._settings.theme];
	}
	public get themes(): Record<string, ThemeColor> {
		return this._menuThemes;
	}

	public setAppTheme(theme: string): void {
		if (!Object.prototype.hasOwnProperty.call(this._menuThemes, theme)) {
			throw Error('Wrong theme!');
		}
		const body = document.getElementsByTagName('body')[0];
		body.className = theme;
		this._settings.theme = theme;
		this._storage.setItem('settings', JSON.stringify(this._settings));
	}

	public setStayLoggedIn(stayLoggedIn: boolean): void {
		this._settings.stayLoggedIn = stayLoggedIn;
		this._storage.setItem('settings', JSON.stringify(this._settings));
	}
	
}

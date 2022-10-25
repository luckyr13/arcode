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
	private _menuThemes: Record<string, string> = {
		'': 'default',
		'theme-dark': 'theme-dark',
		'aura': 'aura',
		'github-dark': 'github-dark',
		'github-light': 'github-light',
		'dracula': 'dracula',
		'solarized-dark': 'solarized-dark',
		'solarized-light': 'solarized-light',
		'material-dark': 'material-dark',
		'material-light': 'material-light'
		
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
	public get menuTheme(): string {
		return this._menuThemes[this._settings.theme];
	}
	public get themes(): Record<string, string> {
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

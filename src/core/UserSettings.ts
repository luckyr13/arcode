import { Settings } from './interfaces/Settings';

export class UserSettings {
	private _settings: Settings;
	private _storage = window.localStorage;
	private _menuThemes: Record<string, string> = {
		'': 'default',
		'theme-dark': 'theme-dark',
		'dark-blue': 'dark-blue',
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

		const settingsString = this._storage.getItem('settings');
		if (settingsString) {
			this._settings = JSON.parse(settingsString);
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

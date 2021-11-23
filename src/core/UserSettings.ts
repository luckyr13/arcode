import { Settings } from './interfaces/Settings';

export class UserSettings {
	private _settings: Settings = { lang: 'en', theme: 'theme-dark'};

	public get settings() : Settings {
		return this._settings;
	}
	public set settings(v : Settings) {
		this._settings = v;
	}
	
}

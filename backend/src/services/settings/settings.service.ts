import {Injectable} from '@nestjs/common';
import {Settings} from 'common/interfaces/settings';

@Injectable()
export class SettingsService {
  get(): Settings {
    return {
      geoExportFormat: 'GeoJSON',
      preferTransliteration: true,
      preferredLanguage: 'deu'
    };
  }
}

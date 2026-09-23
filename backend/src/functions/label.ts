import {Label, LabelType, labelTypes, PreferredLabels} from 'common/interfaces/concept';
import {Settings} from 'common/interfaces/settings';


export const getPreferredLabel = (labels: Label[], type: LabelType, settings: Settings): string => {
  return getPreferredTransliteration(
    labels.find(l => l.type === type && l.language === settings.preferredLanguage)
    ?? labels.find(l => l.type === type)
    ?? {label: '', transliteration: '', language: 'xxx', type},
    settings
  );
};

export const getPreferredTransliteration = (label: Label, settings: Settings): string =>
  settings.preferTransliteration ? (label.transliteration || label.label) : label.label;

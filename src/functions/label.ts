import {Label, LabelType, labelTypes, PreferredLabels} from 'common/interfaces/concept';
import {Settings} from 'common/interfaces/settings';


export const getPreferredLabel = (labels: Label[], type: LabelType, settings: Settings): string => {
  console.log(labels);
  return getPreferredTransliteration(
    labels.find(l => l.type === type && l.language === settings.preferredLanguage)
    ?? labels.find(l => l.type === type)
    ?? {label: '', transliteration: '', language: 'xxx', type},
    settings
  );
}
export const getPreferredTransliteration = (label: Label, settings: Settings): string =>
  settings.preferTransliteration ? (label.transliteration || label.label) : label.label;

export const getPreferredLabels = (labels: Label[], settings: Settings): PreferredLabels =>
  Object
    .fromEntries(
      labelTypes
        .map(ltype => [ltype, getPreferredLabel(labels, ltype, settings)])
        .filter(entry => !!entry[1])
    );

import {TemporalConcept} from 'concepts-common/src/interfaces/concept';

export function* dummyConceptGenerator(): Generator<TemporalConcept> {
  let index = 0;
  while (index++ < Infinity) yield {
    temporalExtends: [{
      start: {
        precision: 0,
        certainty: 0,
        min: -300 * (index % 2 + index),
        max: -300 * (index % 2 + index)
      },
      end: {
        precision: 0,
        certainty: 0,
        min: 300 * (index % 7 + index),
        max: 300 * (index % 7 + index)
      }
    }],
    title: `Title #${index}`,
    description: `Description #${index}`,
    labels: [
      {
        type: "title",
        label: `Title #${index}`,
        language: "eng",
        transliteration: ""
      },
      {
        type: "description",
        label: `Description #${index}`,
        language: "eng",
        transliteration: ""
      }
    ],
    relations: {
      to: [],
      from: []
    },
    id: {
      id: String(index),
      type: "dummy"
    }
  };
};

const generator = dummyConceptGenerator();

export const dummyData: TemporalConcept[] = Array.from({length: 10}).map(_ => generator.next().value);

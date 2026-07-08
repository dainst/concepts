import {TemporalConcept} from 'concepts-common/src/interfaces/concept';

function* dummyConceptGenerator(): Generator<TemporalConcept> {
  let index = 0;
  while (true) yield {
    temporalExtends: [{
      start: {
        precision: 0,
        certainty: 0,
        min: -10 * index % 5 + index,
        max: -10 * index % 5 + index
      },
      end: {
        precision: 0,
        certainty: 0,
        min: 10 * index % 5 + index,
        max: 10 * index % 5 + index
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

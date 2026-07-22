import {Concept, ConceptAbstract, TemporalConcept} from 'concepts-common/interfaces/concept';

interface GeneratedNumbers {
  nr: number,
  children: number[],
  successor: number | undefined,
  a: number,
  b: number,
  parent: number
}

const generateNumbers = (nr: number): GeneratedNumbers => {
  let r: GeneratedNumbers = {
    nr,
    children: [],
    successor: undefined,
    a: NaN,
    b: NaN,
    parent: NaN
  }

  r.a = (nr * 50 + ((nr % 3) * 5 - (nr % 5) * 3) + (nr >= 0 ? generateNumbers(nr - 1).b : -2500)) % 2500;
  r.b = (r.a + (nr % 7) * 50 + nr * (nr % 4)) % 2500;
  if (r.a > r.b) r = {
    ...r,
    a: r.b,
    b: r.a
  };

  if ((nr % 4 === 0) && (nr != 0)) {
    r.children.push(nr - 1, nr - 2, nr - 3);
    r.successor = nr + 4;
  }
  if ((nr % 4 === 0) || (nr % 4 === 1) || (nr % 4 === 2)) {
    r.successor = nr + 1;
    r.parent = Math.ceil(nr / 4) * 4
  }

  return r
}

export function* dummyConceptGenerator(): Generator<Concept> {
  const makeObj = (i: number): ConceptAbstract => ({
    id: {
      id: String(i),
      type: "dummy"
    },
  });

  let index = 0;
  while (index++ < Infinity) {
    const numbers = generateNumbers(index);
    yield {
      temporalExtends: [{
        start: {
          precision: 0,
          certainty: 0,
          min: numbers.a,
          max: numbers.a
        },
        end: {
          precision: 0,
          certainty: 0,
          min: numbers.b,
          max: numbers.b
        }
      }],
      title: `Title #${index}`,
      description: `Description #${index}`,
      domain: 'dummy',
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
      relationsTo: [
        {
          relation: {
            id: {
              id: 'hasPart',
              type: 'chronontology'
            },
          },
          objects: numbers.children.map(makeObj)
        },
        {
          relation: {
            id: {
              id: 'isFollowedBy',
              type: 'chronontology'
            },
          },
          objects: numbers.successor ? [makeObj(numbers.successor)] : []
        },
        {
          relation: {
            id: {
              id: 'isPartOf',
              type: 'chronontology'
            },
          },
          objects: numbers.parent ? [makeObj(numbers.parent)] : []
        }
      ],
      id: {
        id: String(index),
        type: "dummy"
      }
    };
  }
}

// const generator = dummyConceptGenerator();
// const dummyData: TemporalConcept[] = Array.from({length: 30}).map(_ => generator.next().value);
// console.table(dummyData.map(d => ([d.id.id, d.temporalExtends[0].start.min, d.temporalExtends[0].end.min])));

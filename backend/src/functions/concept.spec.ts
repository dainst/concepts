import {Concept} from 'common/interfaces/concept';
import {conceptItemDiff, getItemId} from './concept';

describe("conceptItemDiff", () => {
  it("should substract", () => {
    const c1: Concept = {
      domain: '',
      geographicalExtends: [],
      id: {
        id: "c1",
        type: "test"
      },
      labels: [{
        id: 'l1',
        type: "title",
        label: "",
        language: "",
        transliteration: ""
      }, {
        id: 'l2',
        type: "title",
        label: "",
        language: "",
        transliteration: ""
      }
      ],
      relations: [],
      temporalExtends: []
    };
    const c2: Concept = {
      domain: '',
      geographicalExtends: [],
      id: {
        id: "c1",
        type: "test"
      },
      labels: [{
        id: 'l2',
        type: "title",
        label: "",
        language: "",
        transliteration: ""
      }
      ],
      relations: [],
      temporalExtends: []
    };
    const intersection = conceptItemDiff('labels', c1, c2);
    console.log(intersection.map(getItemId))
    expect(intersection.map(getItemId)).toEqual(['l1']);
  });
});

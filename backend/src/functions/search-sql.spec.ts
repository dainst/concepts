import {buildWhere, existsCond, joinSqlFragments} from './search-sql';
import {SqlCommand} from '../interfaces/sql';
import {ConceptSelector} from '../../../common/src/interfaces/search';


describe("joinSqlFragments", () => {
  it("should join then", () => {
    const c1: SqlCommand = ['A', 1, 2];
    const c2: SqlCommand = ['B', 3, 4];
    const joined =  ['(A) or (B)', 1, 2, 3, 4];
    expect(joinSqlFragments('or', [c1, c2]))
      .toEqual(joined);
  });

  it("should join then with one condition as well", () => {
    const c1: SqlCommand = ['A', 1];
    const joined =  ['(A)', 1];
    expect(joinSqlFragments('and', [c1]))
      .toEqual(joined);
  });
});

describe('existsCond', () => {
  it('should write an exists condition to it', () => {
    const c1: SqlCommand = ['A', 1];
    const expectation: SqlCommand = ['exists (select 1 from labels where A and concepts.id = labels.concept_id and concepts.type = labels.concept_type)', 1];
    expect(existsCond('labels', c1))
      .toEqual(expectation);
  })
})

describe('buildWhere', () => {
  it('should handle q', () => {
    const q: ConceptSelector = {
      q: 'findme'
    };
    const expectation = [
      "(exists (select 1 from labels where label ilike ? and concepts.id = labels.concept_id and concepts.type = labels.concept_type))",
      "%findme%"
    ];
    expect(buildWhere(q)).toEqual(expectation);
  });
});

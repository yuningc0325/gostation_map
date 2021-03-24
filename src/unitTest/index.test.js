import { sum, getSecondItemFromArray } from '../utils'

it('sums numbers', () => {
  expect(sum(1, 2)).toEqual(3);
  expect(sum(2, 2)).toEqual(4);
})


it('get second item from array', () => {
  expect(getSecondItemFromArray([1,2])).toEqual(2);
  expect(getSecondItemFromArray([1])).toEqual(1);
  expect(getSecondItemFromArray([])).toEqual(null);
})
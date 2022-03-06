import { PaginatorInfo } from '@framework/types';
import camelCaseKeys from 'camelcase-keys';

export const mapPaginatorData = (obj: PaginatorInfo) => {
  const formattedValues = camelCaseKeys(obj);
  return {
    ...(formattedValues as PaginatorInfo),
    hasMorePages: formattedValues.lastPage !== formattedValues.currentPage,
  };
};

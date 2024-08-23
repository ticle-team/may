import _ from 'lodash-es';

interface ObjectLiteral {
  [key: string]: any;
}

export function snakeToCamel(obj: ObjectLiteral): ObjectLiteral {
  if (_.isArray(obj)) {
    return obj.map((v) => snakeToCamel(v));
  }
  if (_.isObject(obj)) {
    return _.mapValues(
      _.mapKeys(obj, (v, k) => _.camelCase(k)),
      (v) => snakeToCamel(v),
    );
  }
  return obj;
}

export function camelToSnake(obj: ObjectLiteral): ObjectLiteral {
  if (_.isArray(obj)) {
    return obj.map((v) => camelToSnake(v));
  }
  if (_.isObject(obj)) {
    return _.mapValues(
      _.mapKeys(obj, (v, k) => _.snakeCase(k)),
      (v) => camelToSnake(v),
    );
  }
  return obj;
}

import { UrlUtils } from './url.utils';
import { SimpleResource } from '../model/resource/resources.test';

describe('UrlUtils', () => {

  const baseUrl = 'http://localhost:8080/api/v1';
  const notTemplatedUrl = 'http://localhost:8080/api/v1/resource/1';
  const templatedUrl = 'http://localhost:8080/api/v1/pagedResourceCollection{?page,size,sort,projection,any}';

  it('CONVERT_TO_HTTP_PARAMS should return empty http request params when passed options is null', () => {
    expect(UrlUtils.convertToHttpParams(null).keys().length).toBe(0);
  });

  it('CONVERT_TO_HTTP_PARAMS should return empty http request params when passed options is undefined', () => {
    expect(UrlUtils.convertToHttpParams(undefined).keys().length).toBe(0);
  });

  it('CONVERT_TO_HTTP_PARAMS should return empty http request params when passed options is empty', () => {
    expect(UrlUtils.convertToHttpParams({}).keys().length).toBe(0);
  });

  it('CONVERT_TO_HTTP_PARAMS should throw error when option.params has projection param', () => {
    expect(() => UrlUtils.convertToHttpParams({params: {projection: 'test'}}))
      .toThrowError('Please, pass projection param in projection object key, not with params object!');
  });

  it('CONVERT_TO_HTTP_PARAMS should throw error when option.params has page param', () => {
    expect(() => UrlUtils.convertToHttpParams({params: {page: 'test'}}))
      .toThrowError('Please, pass page params in page object key, not with params object!');
  });

  it('CONVERT_TO_HTTP_PARAMS should throw error when option.params has size param', () => {
    expect(() => UrlUtils.convertToHttpParams({params: {size: 'test'}}))
      .toThrowError('Please, pass page params in page object key, not with params object!');
  });

  it('CONVERT_TO_HTTP_PARAMS should throw error when option.params has sort param', () => {
    expect(() => UrlUtils.convertToHttpParams({params: {sort: 'test'}}))
      .toThrowError('Please, pass page params in page object key, not with params object!');
  });

  it('CONVERT_TO_HTTP_PARAMS should adds resource param as self href link', () => {
    const simpleResource = new SimpleResource();
    const result = UrlUtils.convertToHttpParams({params: {res: simpleResource}});

    expect(result.has('res')).toBeTrue();
    expect(result.get('res')).toBe(simpleResource._links.self.href);
  });

  it('CONVERT_TO_HTTP_PARAMS should adds primitives param as is', () => {
    const result = UrlUtils.convertToHttpParams({params: {str: 'test', num: 1, bol: true}});

    expect(result.has('str')).toBeTrue();
    expect(result.get('str')).toBe('test');

    expect(result.has('num')).toBeTrue();
    expect(result.get('num')).toBe('1');

    expect(result.has('bol')).toBeTrue();
    expect(result.get('bol')).toBe('true');
  });

  it('CONVERT_TO_HTTP_PARAMS should adds page params', () => {
    const result = UrlUtils.convertToHttpParams({
      pageParam: {
        page: 1,
        size: 20,
        sort: {
          abs: 'ASC',
          dce: 'DESC'
        }
      }
    });

    expect(result.has('page')).toBeTrue();
    expect(result.get('page')).toBe('1');

    expect(result.has('size')).toBeTrue();
    expect(result.get('size')).toBe('20');

    expect(result.has('sort')).toBeTrue();
    expect(result.getAll('sort')[0]).toBe('abs,ASC');
    expect(result.getAll('sort')[1]).toBe('dce,DESC');
  });

  it('CONVERT_TO_HTTP_PARAMS should adds projection param', () => {
    const result = UrlUtils.convertToHttpParams({
      projection: 'testProjection'
    });

    expect(result.has('projection')).toBeTrue();
    expect(result.get('projection')).toBe('testProjection');
  });

  it('GENERATE_RESOURCE_URL should throw error when base url is null', () => {
    expect(() => UrlUtils.generateResourceUrl(null, 'any'))
      .toThrowError('Base url and resource name should be defined');
  });

  it('GENERATE_RESOURCE_URL should throw error when base url is undefined', () => {
    expect(() => UrlUtils.generateResourceUrl(undefined, 'any'))
      .toThrowError('Base url and resource name should be defined');
  });

  it('GENERATE_RESOURCE_URL should throw error when base url is empty', () => {
    expect(() => UrlUtils.generateResourceUrl('', 'any'))
      .toThrowError('Base url and resource name should be defined');
  });

  it('GENERATE_RESOURCE_URL should throw error when resourceName is null', () => {
    expect(() => UrlUtils.generateResourceUrl('any', null))
      .toThrowError('Base url and resource name should be defined');
  });

  it('GENERATE_RESOURCE_URL should throw error when resourceName is undefined', () => {
    expect(() => UrlUtils.generateResourceUrl('any', undefined))
      .toThrowError('Base url and resource name should be defined');
  });

  it('GENERATE_RESOURCE_URL should throw error when resourceName is empty', () => {
    expect(() => UrlUtils.generateResourceUrl('any', ''))
      .toThrowError('Base url and resource name should be defined');
  });

  it('GENERATE_RESOURCE_URL should return url with base url and resourceName', () => {
    expect(UrlUtils.generateResourceUrl(baseUrl, 'test')).toBe(`${ baseUrl }/test`);
  });

  it('GENERATE_RESOURCE_URL should return url with base url and resourceName and query', () => {
    expect(UrlUtils.generateResourceUrl(baseUrl, 'test', 'testQuery')).toBe(`${ baseUrl }/test/testQuery`);
  });

  it('REMOVE_TEMPLATE_PARAMS should throw error when url is null', () => {
    expect(() => UrlUtils.removeTemplateParams(null))
      .toThrowError('Url should be defined');
  });

  it('REMOVE_TEMPLATE_PARAMS should throw error when url is undefined', () => {
    expect(() => UrlUtils.removeTemplateParams(undefined))
      .toThrowError('Url should be defined');
  });

  it('REMOVE_TEMPLATE_PARAMS should throw error when url is empty', () => {
    expect(() => UrlUtils.removeTemplateParams(''))
      .toThrowError('Url should be defined');
  });

  it('REMOVE_TEMPLATE_PARAMS should do nothing when url is not templated', () => {
    expect(UrlUtils.removeTemplateParams(notTemplatedUrl)).toBe(notTemplatedUrl);
  });

  it('REMOVE_TEMPLATE_PARAMS should remove template param from url', () => {
    expect(UrlUtils.removeTemplateParams(templatedUrl)).toBe('http://localhost:8080/api/v1/pagedResourceCollection');
  });

  it('FILL_TEMPLATE_PARAMS should throw error when url is null', () => {
    expect(() => UrlUtils.fillTemplateParams(null, {params: {test: ''}}))
      .toThrowError('Url should be defined');
  });

  it('FILL_TEMPLATE_PARAMS should throw error when url is undefined', () => {
    expect(() => UrlUtils.fillTemplateParams(undefined, {params: {test: ''}}))
      .toThrowError('Url should be defined');
  });

  it('FILL_TEMPLATE_PARAMS should throw error when url is empty', () => {
    expect(() => UrlUtils.fillTemplateParams('', {params: {test: ''}}))
      .toThrowError('Url should be defined');
  });

  it('FILL_TEMPLATE_PARAMS should clear template params when options is null', () => {
    expect(UrlUtils.fillTemplateParams(templatedUrl, null)).toBe('http://localhost:8080/api/v1/pagedResourceCollection');
  });

  it('FILL_TEMPLATE_PARAMS should clear template params when options is undefined', () => {
    expect(UrlUtils.fillTemplateParams(templatedUrl, undefined)).toBe('http://localhost:8080/api/v1/pagedResourceCollection');
  });

  it('FILL_TEMPLATE_PARAMS should fill ALL template params', () => {
    expect(UrlUtils.fillTemplateParams(templatedUrl, {
      params: {
        any: 123
      },
      projection: 'testProjection',
      pageParam: {
        page: 2,
        size: 30,
        sort: {
          first: 'ASC',
          second: 'DESC'
        }
      }
    }))
      .toBe('http://localhost:8080/api/v1/pagedResourceCollection?page=2&size=30&projection=testProjection&any=123&sort=first,ASC&sort=second,DESC');
  });

  it('FILL_TEMPLATE_PARAMS should fill passed template params other clear', () => {
    expect(UrlUtils.fillTemplateParams(templatedUrl, {
      params: {
        any: 123
      },
      pageParam: {
        page: 2,
        size: 30,
      }
    }))
      .toBe('http://localhost:8080/api/v1/pagedResourceCollection?page=2&size=30&any=123');
  });

});

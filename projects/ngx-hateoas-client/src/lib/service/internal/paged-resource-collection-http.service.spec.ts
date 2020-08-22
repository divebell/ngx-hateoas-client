import { async } from '@angular/core/testing';
import { HttpConfigService } from '../../config/http-config.service';
import { ResourceCollection } from '../../model/resource/resource-collection';
import { BaseResource } from '../../model/resource/base-resource';
import { of } from 'rxjs';
import {
  rawEmbeddedResource,
  rawPagedResourceCollection,
  rawResource,
  rawResourceCollection,
  SimplePagedResourceCollection,
  SimpleResource
} from '../../model/resource/resources.test';
import { ResourceUtils } from '../../util/resource.utils';
import { HttpParams } from '@angular/common/http';
import { PagedResourceCollectionHttpService } from './paged-resource-collection-http.service';
import { PagedResourceCollection } from '../../model/resource/paged-resource-collection';
import { Resource } from '../../model/resource/resource';

/* tslint:disable:no-string-literal */
describe('PagedpagedResourceCollectionHttpService', () => {
  let pagedResourceCollectionHttpService: PagedResourceCollectionHttpService<PagedResourceCollection<BaseResource>>;
  let httpClientSpy: any;
  let cacheServiceSpy: any;
  let httpConfigService: HttpConfigService;

  beforeEach(async(() => {
    httpClientSpy = {
      get: jasmine.createSpy('get')
    };
    cacheServiceSpy = {
      putResource: jasmine.createSpy('putResource'),
      hasResource: jasmine.createSpy('hasResource'),
      getResource: jasmine.createSpy('getResource')
    };
    httpConfigService = {
      baseApiUrl: 'http://localhost:8080/api/v1'
    };

    pagedResourceCollectionHttpService =
      new PagedResourceCollectionHttpService<PagedResourceCollection<BaseResource>>(httpClientSpy, cacheServiceSpy, httpConfigService);

    ResourceUtils.useResourceType(Resource);
    ResourceUtils.useResourceCollectionType(ResourceCollection);
    ResourceUtils.usePagedResourceCollectionType(PagedResourceCollection);
  }));

  it('GET REQUEST should throw error when returned object is EMBEDDED_RESOURCE', () => {
    httpClientSpy.get.and.returnValue(of(rawEmbeddedResource));

    pagedResourceCollectionHttpService.getHttp('someUrl').subscribe(() => {
    }, error => {
      expect(error.message).toBe('You try to get wrong resource type, expected paged resource collection type.');
    });
  });

  it('GET REQUEST should throw error when returned object is RESOURCE', () => {
    httpClientSpy.get.and.returnValue(of(rawResource));

    pagedResourceCollectionHttpService.getHttp('someUrl').subscribe(() => {
    }, error => {
      expect(error.message).toBe('You try to get wrong resource type, expected paged resource collection type.');
    });
  });

  it('GET REQUEST should throw error when returned object is COLLECTION_RESOURCE', () => {
    httpClientSpy.get.and.returnValue(of(rawResourceCollection));

    pagedResourceCollectionHttpService.getHttp('someUrl').subscribe(() => {
    }, error => {
      expect(error.message).toBe('You try to get wrong resource type, expected paged resource collection type.');
    });
  });

  it('GET REQUEST should throw error when returned object is any data that not paged resource collection', () => {
    httpClientSpy.get.and.returnValue(of({any: 'value'}));

    pagedResourceCollectionHttpService.getHttp('someUrl').subscribe(() => {
    }, error => {
      expect(error.message).toBe('You try to get wrong resource type, expected paged resource collection type.');
    });
  });

  it('GET REQUEST should return result from cache', () => {
    const cachedResult = new SimplePagedResourceCollection();
    cachedResult.resources.push(Object.assign(new SimpleResource(), {text: 'test cache'}));
    cacheServiceSpy.getResource.and.returnValue(cachedResult);
    cacheServiceSpy.hasResource.and.returnValue(true);

    pagedResourceCollectionHttpService.getHttp('someUrl').subscribe((result) => {
      expect(httpClientSpy.get.calls.count()).toBe(0);
      expect(cacheServiceSpy.getResource.calls.count()).toBe(1);
      expect(result.resources.length).toBe(2);
      expect(result.resources[1]['text']).toBe('test cache');
    });
  });

  it('GET REQUEST should put result to cache', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.getHttp('someUrl').subscribe(() => {
      expect(cacheServiceSpy.putResource.calls.count()).toBe(1);
    });
  });

  it('GET REQUEST should return paged collected resource', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.getHttp('someUrl').subscribe((result) => {
      expect(result instanceof PagedResourceCollection).toBeTrue();
    });
  });

  it('GET_RESOURCE_PAGE throws error when resourceName is empty', () => {
    expect(() => pagedResourceCollectionHttpService.getResourcePage(''))
      .toThrowError(`Passed param(s) 'resourceName = ' is not valid`);
  });

  it('GET_RESOURCE_PAGE throws error when resourceName is null', () => {
    expect(() => pagedResourceCollectionHttpService.getResourcePage(null))
      .toThrowError(`Passed param(s) 'resourceName = null' is not valid`);
  });

  it('GET_RESOURCE_PAGE throws error when resourceName is undefined', () => {
    expect(() => pagedResourceCollectionHttpService.getResourcePage(undefined))
      .toThrowError(`Passed param(s) 'resourceName = undefined' is not valid`);
  });

  it('GET_RESOURCE_PAGE should generate root resource url', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.getResourcePage('test').subscribe(() => {
      const url = httpClientSpy.get.calls.argsFor(0)[0];
      expect(url).toBe(`${ httpConfigService.baseApiUrl }/test`);
    });
  });

  it('GET_RESOURCE_PAGE should generate root resource url with query param', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.getResourcePage('test', 'someQuery').subscribe(() => {
      const url = httpClientSpy.get.calls.argsFor(0)[0];
      expect(url).toBe(`${ httpConfigService.baseApiUrl }/test/someQuery`);
    });
  });

  it('GET_RESOURCE_PAGE should pass http request params when it passed', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.getResourcePage('test', null, {
      projection: 'testProjection',
      params: {
        test: 'testParam'
      },
      pageParams: {
        page: 1,
        size: 2,
        sort: {
          prop1: 'DESC',
          prop2: 'ASC'
        }
      }
    }).subscribe(() => {
      const httpParams = httpClientSpy.get.calls.argsFor(0)[1].params as HttpParams;
      expect(httpParams.has('projection')).toBeTrue();
      expect(httpParams.get('projection')).toBe('testProjection');

      expect(httpParams.has('sort')).toBeTrue();
      expect(httpParams.getAll('sort').length).toBe(2);
      expect(httpParams.getAll('sort')[0]).toBe('prop1,DESC');
      expect(httpParams.getAll('sort')[1]).toBe('prop2,ASC');
      expect(httpParams.has('size')).toBeTrue();
      expect(httpParams.get('size')).toBe('2');
      expect(httpParams.has('page')).toBeTrue();
      expect(httpParams.get('page')).toBe('1');

      expect(httpParams.has('test')).toBeTrue();
      expect(httpParams.get('test')).toBe('testParam');
    });
  });

  it('GET_RESOURCE_PAGE should use default page options', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.getResourcePage('test', null, {
      projection: 'testProjection',
      params: {
        test: 'testParam'
      }
    }).subscribe(() => {
      const httpParams = httpClientSpy.get.calls.argsFor(0)[1].params as HttpParams;
      expect(httpParams.has('projection')).toBeTrue();
      expect(httpParams.get('projection')).toBe('testProjection');

      expect(httpParams.has('size')).toBeTrue();
      expect(httpParams.get('size')).toBe('20');
      expect(httpParams.has('page')).toBeTrue();
      expect(httpParams.get('page')).toBe('0');

      expect(httpParams.has('test')).toBeTrue();
      expect(httpParams.get('test')).toBe('testParam');
    });
  });

  it('SEARCH throws error when resourceName is empty', () => {
    expect(() => pagedResourceCollectionHttpService.search('', 'any'))
      .toThrowError(`Passed param(s) 'resourceName = ' is not valid`);
  });

  it('SEARCH throws error when searchQuery is empty', () => {
    expect(() => pagedResourceCollectionHttpService.search('any', ''))
      .toThrowError(`Passed param(s) 'searchQuery = ' is not valid`);
  });

  it('SEARCH throws error when resourceName,searchQuery are null', () => {
    expect(() => pagedResourceCollectionHttpService.search(null, null))
      .toThrowError(`Passed param(s) 'resourceName = null', 'searchQuery = null' is not valid`);
  });

  it('SEARCH throws error when resourceName,searchQuery are undefined', () => {
    expect(() => pagedResourceCollectionHttpService.search(undefined, undefined))
      .toThrowError(`Passed param(s) 'resourceName = undefined', 'searchQuery = undefined' is not valid`);
  });

  it('SEARCH should generate search resource url', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.search('test', 'someQuery').subscribe(() => {
      const url = httpClientSpy.get.calls.argsFor(0)[0];
      expect(url).toBe(`${ httpConfigService.baseApiUrl }/test/search/someQuery`);
    });
  });

  it('SEARCH should pass http request params when it passed', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.search('test', 'someQuery', {
      projection: 'testProjection',
      params: {
        test: 'testParam'
      },
      pageParams: {
        page: 1,
        size: 2,
        sort: {
          prop1: 'DESC',
          prop2: 'ASC'
        }
      }
    }).subscribe(() => {
      const httpParams = httpClientSpy.get.calls.argsFor(0)[1].params as HttpParams;
      expect(httpParams.has('projection')).toBeTrue();
      expect(httpParams.get('projection')).toBe('testProjection');

      expect(httpParams.has('sort')).toBeTrue();
      expect(httpParams.getAll('sort').length).toBe(2);
      expect(httpParams.getAll('sort')[0]).toBe('prop1,DESC');
      expect(httpParams.getAll('sort')[1]).toBe('prop2,ASC');
      expect(httpParams.has('size')).toBeTrue();
      expect(httpParams.get('size')).toBe('2');
      expect(httpParams.has('page')).toBeTrue();
      expect(httpParams.get('page')).toBe('1');

      expect(httpParams.has('test')).toBeTrue();
      expect(httpParams.get('test')).toBe('testParam');
    });
  });

  it('SEARCH should use default page options', () => {
    httpClientSpy.get.and.returnValue(of(rawPagedResourceCollection));

    pagedResourceCollectionHttpService.search('test', 'someQuery', {
      projection: 'testProjection',
      params: {
        test: 'testParam'
      }
    }).subscribe(() => {
      const httpParams = httpClientSpy.get.calls.argsFor(0)[1].params as HttpParams;
      expect(httpParams.has('projection')).toBeTrue();
      expect(httpParams.get('projection')).toBe('testProjection');

      expect(httpParams.has('size')).toBeTrue();
      expect(httpParams.get('size')).toBe('20');
      expect(httpParams.has('page')).toBeTrue();
      expect(httpParams.get('page')).toBe('0');

      expect(httpParams.has('test')).toBeTrue();
      expect(httpParams.get('test')).toBe('testParam');
    });
  });

});

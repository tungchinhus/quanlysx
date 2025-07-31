import { inject, TestBed } from '@angular/core/testing';
import { CacheService } from './cache.service';


describe('CacheService', () => {
    //let log: LogService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                CacheService,
                //LogService
            ]
        });
        //log = TestBed.get(LogService);
    });

    beforeEach(() => {
        localStorage.setItem('customer', JSON.stringify({}));
        localStorage.setItem('boolean', true.toString());
        localStorage.setItem('number', '2');
    });

    it('should be created', inject([CacheService], (service: CacheService) => {
        expect(service).toBeTruthy();
    }));

    it('should be trigger getString()', inject([CacheService], (service: CacheService) => {
        const value = service.getString('');
        expect(value).toBeDefined();
    }));

    it('should be trigger getNumber()', inject([CacheService], (service: CacheService) => {
        const value = service.getNumber('number');
        expect(value).toBeDefined();
    }));

    it('should be trigger getBoolean()', inject([CacheService], (service: CacheService) => {
        const value = service.getBoolean('boolean');
        expect(value).toBeDefined();
    }));

    it('should be trigger get()', inject([CacheService], (service: CacheService) => {
        service.get('customer');
        service.get('');
        expect(service).toBeTruthy();
    }));

    it('should be trigger set()', inject([CacheService], (service: CacheService) => {
        service.set('string', '');
        service.set('number', 2);
        service.set('boolean', true);
        service.set('object', {});
        // /service.set('default', undefined);
        expect(service).toBeTruthy();
    }));

    it('should be trigger remove()', inject([CacheService], (service: CacheService) => {
        service.remove('string');
        expect(service).toBeTruthy();
    }));
});

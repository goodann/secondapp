import {Observable, Observer} from 'rxjs';
import * as _superagent from 'superagent';
import {SuperAgentRequest} from 'superagent';
import {uiUrlWithParams} from '../base';

const superagentPromise = require('superagent-promise');

const auth = (req: SuperAgentRequest) => {
    return req.on('error', handle);
};

const handle = (err: any) => {
    // check URL to prevent redirect loop
    if (err.status === 401 && !document.location.href.includes('login')) {
        document.location.href = uiUrlWithParams('login', ['redirect=' + document.location.href]);
    }
};

const superagent: _superagent.SuperAgentStatic = superagentPromise(_superagent, global.Promise);

export default {
    get(url: string) {
        return auth(superagent.get('/argo/'+url));
    },

    post(url: string) {
        return auth(superagent.post('/argo/'+url));
    },

    put(url: string) {
        return auth(superagent.put('/argo/'+url));
    },

    patch(url: string) {
        return auth(superagent.patch('/argo/'+url));
    },

    delete(url: string) {
        return auth(superagent.del('/argo/'+url));
    },

    loadEventSource(url: string): Observable<string> {
        return Observable.create((observer: Observer<any>) => {
            const eventSource = new EventSource(url);
            eventSource.onmessage = x => observer.next(x.data);
            eventSource.onerror = x => observer.error(x);
            return () => {
                eventSource.close();
            };
        });
    }
};

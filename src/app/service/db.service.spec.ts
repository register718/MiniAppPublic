import { Observable, of } from "rxjs";
import { DBService } from "./db.service";

export class DBServiceTest extends DBService {

    public justAllow: string;
    postFuncions: { [id:string] : Function};
    getFunctions: { [id:string]: Function};

    constructor() {
        super(null);
        this.justAllow = null;
        this.postFuncions = {};
        this.getFunctions = {};
    }

    addPostFunc(url: string, f: Function) {
        this.postFuncions[url] = f;
    }

    addGetFunction(url: string, f: Function) {
        this.getFunctions[url] = f;
    }

    POST(url: string, data: any): Observable<any> {
        if (this.justAllow != null) {
            expect(url).toEqual(this.justAllow);
            this.justAllow = null;
        }
        expect(this.postFuncions[url]);
        return of ((this.postFuncions[url])(url, data));
    }

    GET(url: string): Observable<any> {
        if (this.justAllow != null) {
            expect(url).toEqual(this.justAllow);
            this.justAllow = null;
        }
        expect(this.getFunctions[url]);
        return of ((this.getFunctions[url])(url));
    }

}

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { first, map } from "rxjs/operators";
import { MatSnackBar } from "@angular/material/snack-bar";
import { WebSocketSubject, webSocket } from "rxjs/webSocket";
import { Demultiplexer } from "../shared/demultiplexer.class";

@Injectable({
    providedIn: 'root'
})

export class DBService {

    public socket: WebSocketSubject<any> = null;

    constructor(private http: HttpClient, private _snackBar: MatSnackBar) {
        this.socket = webSocket('ws://' + window.location.host + '/ws/');
        Demultiplexer.setDB(this, _snackBar);
    }

    POST(url: string, data: any) {
         console.log('POST', data);
         return this.http.post('api/' + url, data, {responseType: 'json', headers: {'X-CSRFToken': this.getCSRF()}}).pipe(first());
    }

    GET(url: string) {
        return this.http.get('api/' + url, {responseType: 'json'}).pipe(first());
    }

    DELETE(url: string) {
        return this.http.delete('api/' + url, {responseType: 'json', headers: {'X-CSRFToken': this.getCSRF()}}).pipe(first());
    }

    public getCSRF(): string {
        return this.getCookie('csrftoken');
    }

    private getCookie(name: string): string {
        const nameLenPlus = (name.length + 1);
        return document.cookie
            .split(';')
            .map(c => c.trim())
            .filter(cookie => {
                return cookie.substring(0, nameLenPlus) === `${name}=`;
            })
            .map(cookie => {
                return decodeURIComponent(cookie.substring(nameLenPlus));
            })[0]  || null;
    }

    string2date(datum: string) : Date {
      try {
        const s = datum.split('-')
        return new Date(Number(s[0]), Number(s[1]), Number(s[2]));
      } catch (_err) {
        console.log(_err)
        return new Date();
      }
    }

    showLoadError() {
        this._snackBar.open("Daten konnten nicht geladen werden", "OK");
    }
}

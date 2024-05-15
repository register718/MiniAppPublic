// *ngComponentOutlet
import { Component } from "@angular/core";

export abstract class IElement {
   abstract setValue(obj: any);
}

@Component({
    selector: 'app-raw-paragraph',
    template: `
    `,
    styles: []
})
export class Paragraph extends IElement {

    private text: string = "";

    setValue(obj: any) {
        if (typeof(obj) === "string")
            this.text = obj;
    }

}
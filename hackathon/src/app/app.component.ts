import { Component, OnInit } from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {WebcamImage} from 'ngx-webcam';
import {ComputerVisionService} from "./computer-vision.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //title of the app
  title = 'hackathon';
  //Constructor to initialize the prediction component
  constructor(private computerVision: ComputerVisionService) {}
  // latest snapshot took by the webcam
  public webcamImage: WebcamImage = null;
  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  private recording : boolean = false;

  public record() {
    this.recording = true;
    if (typeof Worker !== 'undefined') {
      // Create a new
      const worker = new Worker('./web-worker.worker', { type: 'module' });
      worker.onmessage = ({ data }) => {
        if(this.recording){
          this.triggerSnapshot();
        }
      };
      worker.postMessage("WebCamTriggered");
    } else {
      // Web Workers are not supported in this environment.
      // You should add a fallback so that your program still executes correctly.
    }
  }

  public stopRecord(): void {
    this.recording = false;
  }


  public triggerSnapshot(): void {
    this.trigger.next();
    this.createImg(this.webcamImage);
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image');
    this.webcamImage = webcamImage;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  async createImg(webcamImage: WebcamImage) {
    let blob = this.dataURItoBlob(webcamImage.imageAsDataUrl);
    let yeet = await this.computerVision.predict(blob);
    console.log(yeet);
  }

  dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    let blob = new Blob([ab], {type: mimeString});
    return blob;
  }
}

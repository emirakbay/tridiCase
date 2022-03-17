import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { EngineService } from './engine.service';

@Component({
  selector: 'app-engine',
  templateUrl: './engine.component.html'
})
export class EngineComponent implements OnInit {

  file: File;
  logo: File;

  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  public constructor(private engServ: EngineService) {
  }

  public ngOnInit(): void {
    this.engServ.createScene(this.rendererCanvas);
    this.engServ.animate();
  }

  public onModelChange(event): void {
    this.file = event.target.files[0];
    this.engServ.setFile(this.file);
  }

  public onLogoChange(event): void {
    this.file = event.target.files[0];
    this.engServ.setLogo(this.file);
  }

  public onScreenShotClick(): void {
    this.engServ.takeScreenshot();
  }

  public setColor(event): void {
    this.engServ.setPlaneColor(event.target.value);
  }
}

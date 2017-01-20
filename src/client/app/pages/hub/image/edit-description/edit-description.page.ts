import { Component, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ImageService } from './../../../../services';

declare let SimpleMDE: any;
declare let messager: any;

@Component({
  selector: 'hb-image-edit-description',
  templateUrl: './edit-description.html',
  styleUrls: ['./edit-description.css']
})
export class EditImageDescriptionPage {

  @ViewChild('descriptionEditor')
  private descriptionEditor: ElementRef;

  private imageId: string;
  private image: any;
  private simplemde: any;

  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _imageService: ImageService) {

  }

  ngOnInit() {
    let paramSub = this._route.params.subscribe(param => {
      this.imageId = param['imageId'];
      this._imageService.getImageInfoFromDB(this.imageId)
        .then(data => {
          this.image = data;
          if (this.simplemde) {
            this.simplemde.value(this.image.Description);
          }
        })
        .catch(err => {
          messager.error(err);
          this._router.navigate(['/hub']);
        });
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
    this.simplemde.toTextArea();
    this.simplemde = null;
  }

  ngAfterViewInit() {
    this.simplemde = new SimpleMDE({
      element: this.descriptionEditor.nativeElement,
      placeholder: 'Type description here(markdown)...',
      autoDownloadFontAwesome: false,
      hideIcons: ['guide'],
      autofocus: true,
      autosave: {
        enabled: true,
        uniqueId: "description-editor-id",
        delay: 1000,
      },
    });
    if (this.image) {
      this.simplemde.value(this.image.Description);
    }
  }

  private save() {
    let value = this.simplemde.value();
    if (!value) {
      messager.error('Description cannot be empty.');
      return;
    }
    this.image.Description = value;
    this._imageService.saveImageInfoToDB(this.image)
      .then(res => {
        messager.success('Updated.');
        this._router.navigate(['/hub', '_', this.imageId, 'overview']);
      })
      .catch(err => {
        messager.error(err);
      });
  }
}
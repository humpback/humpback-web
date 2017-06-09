import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageService, HubService, SystemConfigService } from './../../../../services';

declare let _: any;
declare let hljs: any;
declare let marked: any;
declare let messager: any;

@Component({
  selector: 'hb-image-overview',
  templateUrl: './image-overview.html',
  styleUrls: ['./image-overview.css']
})
export class ImageOverviewPage {

  private imageId: string;
  private image: any = {};
  private imageDescription: any;
  private imageDockerfile: any;
  private tags: Array<string> = [];

  private activedTab: string = 'description';
  private privateRegistryAddress: string;

  private editDockerfileModal: any;

  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private sanitizer: DomSanitizer,
    private _imageService: ImageService,
    private _hubService: HubService,
    private _systemConfigService: SystemConfigService) {

  }

  ngOnInit() {
    this.editDockerfileModal = {
      show: false,
      title: 'Edit Dockerfile',
      size: 'lg',
      closable: false,
      hideFooter: true
    };
    let config = this._systemConfigService.Config;
    let tempUrl = new URL(`${config.PrivateRegistry}`);
    this.privateRegistryAddress = tempUrl.host;
    //if (tempUrl.port) {
    //  this.privateRegistryAddress += `:${tempUrl.port}`;
    //}
    let paramSub = this._route.params.subscribe(param => {
      this.imageId = param['imageId'];
      this.getImageInfo();
    });
    this.subscribers.push(paramSub);
  }

  ngOnDestroy() {
    this.subscribers.forEach((item: any) => item.unsubscribe());
  }

  private getImageInfo() {
    this._imageService.getImageInfoFromDB(this.imageId)
      .then(data => {
        this.image = data;
        let renderer = new marked.Renderer();
        renderer.code = (code: any, language: any) => {
          const validLang = !!(language && hljs.getLanguage(language));
          const highlighted = validLang ? hljs.highlight(language, code).value : code;
          return `<pre style="padding: 0; border-radius: 0;"><code class="hljs ${language}">${highlighted}</code></pre>`;
        };
        marked.setOptions({ renderer });
        let html = marked(this.image.Description || '');
        this.imageDescription = this.sanitizer.bypassSecurityTrustHtml(html);
        this.highlightDockerfile(this.image.Dockerfile);
      })
      .catch(err => {
        messager.error(err);
        this._router.navigate(['/hub']);
      });
  }

  private getImageTags() {
    this._hubService.getTags('gdev', this.imageId, false)
      .then(tags => {
        this.tags = tags;
      })
      .catch(err => {
        messager.error(err);
      });
  }

  private highlightDockerfile(dockerfile: string) {
    let highlighted = hljs.highlight('dockerfile', dockerfile || '').value;
    this.imageDockerfile = highlighted;
  }

  private setTab(value: string) {
    this.activedTab = value;
    if (value === 'tags' && this.tags.length == 0) {
      this.getImageTags();
    }
  }

  private showDockerfileModal() {
    this.editDockerfileModal.submitted = false;
    this.editDockerfileModal.show = true;
  }

  private updateDockerfile(form: any) {
    this.editDockerfileModal.submitted = true;
    if (form.invalid) return;
    let imageInfo = {
      Name: this.image.Name,
      Dockerfile: this.image.Dockerfile
    };
    this.editDockerfileModal.show = false;
    this._imageService.saveImageInfoToDB(imageInfo)
      .then(res => {
        messager.success('Updated.');
        this.highlightDockerfile(this.image.Dockerfile);
      })
      .catch(err => {
        messager.error(err);
      });
  }

  private fileChangeEvent(fileInput: any) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      let file = fileInput.target.files[0];
      if (file.type || file.name !== 'Dockerfile') {
        messager.error('Only support Dockerfile.');
        return;
      }
      if (file.size > 100 * 1024) {
        messager.error('File size limit 100kb.');
        return;
      }
      var reader = new FileReader();
      reader.onload = (e: any) => {
        this.image.Dockerfile = e.target.result;
      }
      reader.readAsText(fileInput.target.files[0]);
    }
  }
}

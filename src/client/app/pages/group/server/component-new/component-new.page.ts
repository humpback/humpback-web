import { Component, Renderer  } from "@angular/core";
import { FormGroup, FormBuilder} from "@angular/forms"
import { ComposeService } from '../../../../services/compose.service';
import { Router, ActivatedRoute } from '@angular/router';

import * as jsYaml from 'js-yaml';
import * as fileSaver from 'file-saver';

declare let messager: any;

@Component({
  selector: 'hb-component-new',
  styleUrls: ['/compose-new.css'],
  templateUrl: './component-new.html',
})

export class ComponentNewPage {

  private form: FormGroup;
  private _editors: any = {};
  private configInfo: any;
  private composeDataError: any;
  private submitted: boolean = false;
  private ip: any;
  private subscribers: Array<any> = [];

  constructor(
    private _route: ActivatedRoute,
    private _composeService: ComposeService,
    private _renderer: Renderer,
    private _fb: FormBuilder,
  ){

  }

  private buildForm(){
    this.form = this._fb.group({
      Name: '',
      Data: ''
    })
  }

  aceLoaded(editor: any, env: string) {
    this._editors[env] = editor;
    editor.$blockScrolling = Infinity;
  }

  private changeValue(){

  }

  private readerFile(reader: any): any{
    let self = this;
    reader.onload = function(event: any) {
      self.form.controls['Data'].setValue(event.target.result);
    };
  }

  selectedFileOnChanged(value: any) {
    if (value) {
      if (event.target && value.target.files.length > 0) {
        let file = value.target.files[0];
        let reader = new FileReader();
        this.readerFile(reader);
        reader.readAsText(file);
      }
      // if (this.inputValue) {
      //   this.fileError = false;
      //   let allowSize = 50 * 1024 * 1024;
      //   if (this.inputValue.size > allowSize) {
      //     this.fileError = true;
      //   }
      // }
      // if (value.target && value.target.value) {
      //   let arr = value.target.value.split('\\');
      //   this.inputFile = arr[arr.length - 1];
      //   this.inputFile = this.inputFile.replace(/.tar/, '');
      //   this.inputFile = this.inputFile.replace(/.gz/, '');
      //   let date = moment(Date.now()).format('YYYY-MM-DD_HH-mm-ss');
      //   this.inputFile = `${this.inputFile}-${date}.tar.gz`;
      // }
    }
  }

  ngOnInit(){
    let paramSub = this._route.params.subscribe(params => {
      this.ip = params['ip'];
    });
    this.subscribers.push(paramSub);
    this.buildForm();
    this.configInfo = {
      // SystemId: this.systemId,
      ConfigKey: '',
      Description: '',
      ConfigValue: '',
      SandboxValue: '',
      _prdMode: 'json',
      _sandMode: 'yaml',
      _prdEnableCanary: false,
      _sandEnableCanary: false
    }
  }

  ngOnDestroy() {
    this.subscribers.forEach(item => item.unsubscribe());
  }

  private showFullScreen(env: string, container: HTMLDivElement) {
    let isFullScreen = container.classList.contains('full-screen');
    let editor = this._editors[env];
    if (editor) {
      this._renderer.setElementStyle(document.body, 'overflow-y', isFullScreen ? 'auto' : 'hidden');
      this._renderer.setElementClass(container, 'full-screen', !isFullScreen);
      editor.resize();
    }
  }

  private checkComposeData(){
    try {
      let doc = jsYaml.safeLoad(this.form.value.Data);
      this.composeDataError = '';
    } catch (e) {
      this.composeDataError = e.message;
    }
  }

  private downloadComposeData(){
    let content = this.form.value.Data;
    let blob = new Blob([content], {type: "text/plain;charset=utf-8"});
    fileSaver.saveAs(blob, "content.yml")
  }

  private onSubmit(){
    this.submitted = true;
    let form = this.form;
    if (form.invalid) return;
    this.checkComposeData();
    if(this.composeDataError) return;
    let config: any = {
      Name: form.value.Name,
      ComposeData: `${form.value.Data}`
    }
    this._composeService.addCompose(this.ip,JSON.parse(JSON.stringify(config)))
      .then(data => {
        // this._router.navigate(['/group']);
      })
      .catch(err => messager.error(err.Detail || err))
  }
}

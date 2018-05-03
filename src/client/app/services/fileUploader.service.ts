import { Injectable } from '@angular/core';
import { GlobalLoadingService } from './global-loading.service';

@Injectable()
export class FileUploader {

  constructor(
    private _globalLoading: GlobalLoadingService
  ) { }

  /**
   * 上传文件
   * @param  {string} Url - 要上传的地址
   * @param  {Blob|File} file - 要上传的内容
   */
  upload(url: string, file: File, options: any): Promise<any> {
    options = options || {};
    return new Promise((resolve, reject) => {
      if (!options.disableLoading) {
        this._globalLoading.add();
      }
      let xhr = new XMLHttpRequest();
      xhr.open('POST', url);
      xhr.setRequestHeader('Content-Type', 'application/tar');
      xhr.addEventListener('readystatechange', (evt) => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status !== 200) {
            return reject(xhr.statusText);
          }
          resolve(url);
        }
      });
      xhr.addEventListener('error', (err) => {
        reject(err);
        this._globalLoading.remove();
      });
      xhr.send(file);
    });
  }
}

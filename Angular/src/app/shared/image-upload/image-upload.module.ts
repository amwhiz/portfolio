import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { FileDropDirective } from './file-drop.directive';
import { ImageUploadComponent } from './image-upload.component';
import { ImageService } from './image.service';
import { PageSpinnerModule } from '../components/page-spinner/page-spinner.module';

@NgModule({
  imports: [CommonModule, HttpModule, PageSpinnerModule],
  declarations: [ImageUploadComponent, FileDropDirective],
  exports: [ImageUploadComponent]
})
export class CoverImageUploadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: CoverImageUploadModule,
      providers: [ImageService]
    }
  }
}

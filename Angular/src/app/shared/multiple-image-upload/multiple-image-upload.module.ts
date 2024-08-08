import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';

import { FileDropDirective } from './file-drop.directive';
import { MultipleImageUploadComponent } from './multiple-image-upload.component';
import { ImageService } from './image.service';
import { FormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, HttpModule, FormsModule],
  declarations: [MultipleImageUploadComponent, FileDropDirective],
  exports: [MultipleImageUploadComponent]
})
export class MultipleImageUploadModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MultipleImageUploadModule,
      providers: [ImageService]
    }
  }
}

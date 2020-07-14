import { ModuleWithProviders, NgModule } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { HalConfigurationService } from './config/hal-configuration.service';
import { HttpConfigService } from './config/http-config.service';

export { HalConfiguration } from './config/hal-configuration.interface';
export { HalConfigurationService } from './config/hal-configuration.service';

@NgModule({
  imports: [HttpClientModule],
  declarations: [],
  providers: [
    HttpClient,
    HttpConfigService
  ],
  exports: [HttpClientModule]
})
export class NgxHalClientModule {
  static forRoot(): ModuleWithProviders<NgxHalClientModule> {
    return {
      ngModule: NgxHalClientModule,
      providers: [
        HttpClient,
        HalConfigurationService
      ]
    };
  }
}

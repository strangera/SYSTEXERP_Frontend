import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../../shared/shared.module';
import { TLS2000RoutingModule } from './tls2000-routing.module';
//
import { TLS21010CRUComponent } from './tls21010-cru/tls21010-cru.component';
import { TLS21010Component } from './tls21010/tls21010.component';
import { TLS21020CRUComponent } from './tls21020-cru/tls21020-cru.component';
import { TLS21020Component } from './tls21020/tls21020.component';
import { TLS21030CRUComponent } from './tls21030-cru/tls21030-cru.component';
import { TLS21030Component } from './tls21030/tls21030.component';
import { TLS21040CRUComponent } from './tls21040-cru/tls21040-cru.component';
import { TLS21040Component } from './tls21040/tls21040.component';
import { TLS21050CRUComponent } from './tls21050-cru/tls21050-cru.component';
import { TLS21050Component } from './tls21050/tls21050.component';
import { TLS22010CRUComponent } from './tls22010-cru/tls22010-cru.component';
import { TLS22010Component } from './tls22010/tls22010.component';
import { TLS22020CRUComponent } from './tls22020-cru/tls22020-cru.component';
import { TLS22020Component } from './tls22020/tls22020.component';
import { TLS22030Component } from './tls22030/tls22030.component';
import { TLS22040Component } from './tls22040/tls22040.component';
import { TLS23010Component } from './tls23010/tls23010.component';
import { TLS23020Component } from './tls23020/tls23020.component';
import { TLS23030Component } from './tls23030/tls23030.component';
import { TLS23040Component } from './tls23040/tls23040.component';
import { TLS23050Component } from './tls23050/tls23050.component';
import { TLS23060Component } from './tls23060/tls23060.component';
import { TLS23070Component } from './tls23070/tls23070.component';
import { TLS23080Component } from './tls23080/tls23080.component';
import { TLS23090Component } from './tls23090/tls23090.component';
import { TLS23100Component } from './tls23100/tls23100.component';
import { TLS23110Component } from './tls23110/tls23110.component';
import { TLS23120Component } from './tls23120/tls23120.component';
import { TLS23130Component } from './tls23130/tls23130.component';
import { TLS23140Component } from './tls23140/tls23140.component';
import { TLS24010CRUComponent } from './tls24010-cru/tls24010-cru.component';
import { TLS24010Component } from './tls24010/tls24010.component';
import { TLS24020CRUComponent } from './tls24020-cru/tls24020-cru.component';
import { TLS24020Component } from './tls24020/tls24020.component';
import { TLS24030CRUComponent } from './tls24030-cru/tls24030-cru.component';
import { TLS24030Component } from './tls24030/tls24030.component';
import { TLS24040CRUComponent } from './tls24040-cru/tls24040-cru.component';
import { TLS24040Component } from './tls24040/tls24040.component';
import { TLS24050CRUComponent } from './tls24050-cru/tls24050-cru.component';
import { TLS24050Component } from './tls24050/tls24050.component';
import { TLS24060CRUComponent } from './tls24060-cru/tls24060-cru.component';
import { TLS24060Component } from './tls24060/tls24060.component';
import { TLS24070CRUComponent } from './tls24070-cru/tls24070-cru.component';
import { TLS24070Component } from './tls24070/tls24070.component';
import { TLS24080CRUComponent } from './tls24080-cru/tls24080-cru.component';
import { TLS24080Component } from './tls24080/tls24080.component';
import { TLS25010CRUComponent } from './tls25010-cru/tls25010-cru.component';
import { TLS25010Component } from './tls25010/tls25010.component';
import { TLS25020CRUComponent } from './tls25020-cru/tls25020-cru.component';
import { TLS25020Component } from './tls25020/tls25020.component';
import { TLS25030CRUComponent } from './tls25030-cru/tls25030-cru.component';
import { TLS25030Component } from './tls25030/tls25030.component';
import { TLS26010CRUComponent } from './tls26010-cru/tls26010-cru.component';
import { TLS26010Component } from './tls26010/tls26010.component';
import { TLS26020CRUComponent } from './tls26020-cru/tls26020-cru.component';
import { TLS26020Component } from './tls26020/tls26020.component';
import { TLS26030CRUComponent } from './tls26030-cru/tls26030-cru.component';
import { TLS26030Component } from './tls26030/tls26030.component';
import { TLS26040CRUComponent } from './tls26040-cru/tls26040-cru.component';
import { TLS26040Component } from './tls26040/tls26040.component';
import { TLS27010CRUComponent } from './tls27010-cru/tls27010-cru.component';
import { TLS27010Component } from './tls27010/tls27010.component';
import { TLS27020CRUComponent } from './tls27020-cru/tls27020-cru.component';
import { TLS27020Component } from './tls27020/tls27020.component';
import { TLS27030CRUComponent } from './tls27030-cru/tls27030-cru.component';
import { TLS27030Component } from './tls27030/tls27030.component';
import { TLS27040CRUComponent } from './tls27040-cru/tls27040-cru.component';
import { TLS27040Component } from './tls27040/tls27040.component';
import { TLS27050CRUComponent } from './tls27050-cru/tls27050-cru.component';
import { TLS27050Component } from './tls27050/tls27050.component';
import { TLS28010CRUComponent } from './tls28010-cru/tls28010-cru.component';
import { TLS28010Component } from './tls28010/tls28010.component';
import { TLS28020CRUComponent } from './tls28020-cru/tls28020-cru.component';
import { TLS28020Component } from './tls28020/tls28020.component';
import { TLS28030CRUComponent } from './tls28030-cru/tls28030-cru.component';
import { TLS28030Component } from './tls28030/tls28030.component';
import { TLS28040CRUComponent } from './tls28040-cru/tls28040-cru.component';
import { TLS28040Component } from './tls28040/tls28040.component';
import { TLS28050CRUComponent } from './tls28050-cru/tls28050-cru.component';
import { TLS28050Component } from './tls28050/tls28050.component';
import { TLS29010CRUComponent } from './tls29010-cru/tls29010-cru.component';
import { TLS29010Component } from './tls29010/tls29010.component';
import { TLS2A010CRUComponent } from './tls2a010-cru/tls2a010-cru.component';
import { TLS2A010Component } from './tls2a010/tls2a010.component';
import { TLS2A020CRUComponent } from './tls2a020-cru/tls2a020-cru.component';
import { TLS2A020Component } from './tls2a020/tls2a020.component';
import { TLS2A030CRUComponent } from './tls2a030-cru/tls2a030-cru.component';
import { TLS2A030Component } from './tls2a030/tls2a030.component';
import { TLS2A040CRUComponent } from './tls2a040-cru/tls2a040-cru.component';
import { TLS2A040Component } from './tls2a040/tls2a040.component';
import { TLS2A050CRUComponent } from './tls2a050-cru/tls2a050-cru.component';
import { TLS2A050Component } from './tls2a050/tls2a050.component';
import { TLS2B010CRUComponent } from './tls2b010-cru/tls2b010-cru.component';
import { TLS2B010Component } from './tls2b010/tls2b010.component';
import { TLS2B020CRUComponent } from './tls2b020-cru/tls2b020-cru.component';
import { TLS2B020Component } from './tls2b020/tls2b020.component';
import { TLS2B030CRUComponent } from './tls2b030-cru/tls2b030-cru.component';
import { TLS2B030Component } from './tls2b030/tls2b030.component';
import { TLS2C010CRUComponent } from './tls2c010-cru/tls2c010-cru.component';
import { TLS2C010Component } from './tls2c010/tls2c010.component';
import { TLS2C020CRUComponent } from './tls2c020-cru/tls2c020-cru.component';
import { TLS2C020Component } from './tls2c020/tls2c020.component';
import { TLS2C030CRUComponent } from './tls2c030-cru/tls2c030-cru.component';
import { TLS2C030Component } from './tls2c030/tls2c030.component';
import { TLS2C040CRUComponent } from './tls2c040-cru/tls2c040-cru.component';
import { TLS2C040Component } from './tls2c040/tls2c040.component';
import { TLS2C050CRUComponent } from './tls2c050-cru/tls2c050-cru.component';
import { TLS2C050Component } from './tls2c050/tls2c050.component';
import { TLS2D010CRUComponent } from './tls2d010-cru/tls2d010-cru.component';
import { TLS2D010Component } from './tls2d010/tls2d010.component';
import { TLS2D020CRUComponent } from './tls2d020-cru/tls2d020-cru.component';
import { TLS2D020Component } from './tls2d020/tls2d020.component';
import { TLS2D030CRUComponent } from './tls2d030-cru/tls2d030-cru.component';
import { TLS2D030Component } from './tls2d030/tls2d030.component';
import { TLS2D040CRUComponent } from './tls2d040-cru/tls2d040-cru.component';
import { TLS2D040Component } from './tls2d040/tls2d040.component';
import { TLS2D050CRUComponent } from './tls2d050-cru/tls2d050-cru.component';
import { TLS2D050Component } from './tls2d050/tls2d050.component';
import { TLS2D060CRUComponent } from './tls2d060-cru/tls2d060-cru.component';
import { TLS2D060Component } from './tls2d060/tls2d060.component';
import { TLS2D070CRUComponent } from './tls2d070-cru/tls2d070-cru.component';
import { TLS2D070Component } from './tls2d070/tls2d070.component';
import { TLS2E010CRUComponent } from './tls2e010-cru/tls2e010-cru.component';
import { TLS2E010Component } from './tls2e010/tls2e010.component';
import { TLS2E020CRUComponent } from './tls2e020-cru/tls2e020-cru.component';
import { TLS2E020Component } from './tls2e020/tls2e020.component';
import { TLS2E030CRUComponent } from './tls2e030-cru/tls2e030-cru.component';
import { TLS2E030Component } from './tls2e030/tls2e030.component';
import { TLS2E040CRUComponent } from './tls2e040-cru/tls2e040-cru.component';
import { TLS2E040Component } from './tls2e040/tls2e040.component';
import { TLS2E050CRUComponent } from './tls2e050-cru/tls2e050-cru.component';
import { TLS2E050Component } from './tls2e050/tls2e050.component';
import { TLS2E060CRUComponent } from './tls2e060-cru/tls2e060-cru.component';
import { TLS2E060Component } from './tls2e060/tls2e060.component';
import { TLS2E070CRUComponent } from './tls2e070-cru/tls2e070-cru.component';
import { TLS2E070Component } from './tls2e070/tls2e070.component';
import { TLS2E080CRUComponent } from './tls2e080-cru/tls2e080-cru.component';
import { TLS2E080Component } from './tls2e080/tls2e080.component';
import { TLS2E090CRUComponent } from './tls2e090-cru/tls2e090-cru.component';
import { TLS2E090Component } from './tls2e090/tls2e090.component';
import { TLS2E100CRUComponent } from './tls2e100-cru/tls2e100-cru.component';
import { TLS2E100Component } from './tls2e100/tls2e100.component';
import { TLS2F010CRUComponent } from './tls2f010-cru/tls2f010-cru.component';
import { TLS2F010Component } from './tls2f010/tls2f010.component';
import { TLS2F020CRUComponent } from './tls2f020-cru/tls2f020-cru.component';
import { TLS2F020Component } from './tls2f020/tls2f020.component';
import { TLS2F030CRUComponent } from './tls2f030-cru/tls2f030-cru.component';
import { TLS2F030Component } from './tls2f030/tls2f030.component';
import { TLS2G010CRUComponent } from './tls2g010-cru/tls2g010-cru.component';
import { TLS2G010Component } from './tls2g010/tls2g010.component';
import { TLS2G020CRUComponent } from './tls2g020-cru/tls2g020-cru.component';
import { TLS2G020Component } from './tls2g020/tls2g020.component';
import { TLS2G030CRUComponent } from './tls2g030-cru/tls2g030-cru.component';
import { TLS2G030Component } from './tls2g030/tls2g030.component';
import { TLS2G040CRUComponent } from './tls2g040-cru/tls2g040-cru.component';
import { TLS2G040Component } from './tls2g040/tls2g040.component';
import { TLS2H010CRUComponent } from './tls2h010-cru/tls2h010-cru.component';
import { TLS2H010Component } from './tls2h010/tls2h010.component';
import { TLS2H020CRUComponent } from './tls2h020-cru/tls2h020-cru.component';
import { TLS2H020Component } from './tls2h020/tls2h020.component';
import { TLS2H030CRUComponent } from './tls2h030-cru/tls2h030-cru.component';
import { TLS2H030Component } from './tls2h030/tls2h030.component';
import { TLS2J010CRUComponent } from './tls2j010-cru/tls2j010-cru.component';
import { TLS2J010Component } from './tls2j010/tls2j010.component';
import { TLS2J020CRUComponent } from './tls2j020-cru/tls2j020-cru.component';
import { TLS2J020Component } from './tls2j020/tls2j020.component';
import { TLS2J030CRUComponent } from './tls2j030-cru/tls2j030-cru.component';
import { TLS2J030Component } from './tls2j030/tls2j030.component';
import { TLS2J040CRUComponent } from './tls2j040-cru/tls2j040-cru.component';
import { TLS2J040Component } from './tls2j040/tls2j040.component';
import { TLS2J050CRUComponent } from './tls2j050-cru/tls2j050-cru.component';
import { TLS2J050Component } from './tls2j050/tls2j050.component';
import { TLS2J060CRUComponent } from './tls2j060-cru/tls2j060-cru.component';
import { TLS2J060Component } from './tls2j060/tls2j060.component';
import { TLS2J070CRUComponent } from './tls2j070-cru/tls2j070-cru.component';
import { TLS2J070Component } from './tls2j070/tls2j070.component';
import { TLS2K010CRUComponent } from './tls2k010-cru/tls2k010-cru.component';
import { TLS2K010Component } from './tls2k010/tls2k010.component';
import { TLS2K020CRUComponent } from './tls2k020-cru/tls2k020-cru.component';
import { TLS2K020Component } from './tls2k020/tls2k020.component';
import { TLS2K030CRUComponent } from './tls2k030-cru/tls2k030-cru.component';
import { TLS2K030Component } from './tls2k030/tls2k030.component';
import { TLS2K040CRUComponent } from './tls2k040-cru/tls2k040-cru.component';
import { TLS2K040Component } from './tls2k040/tls2k040.component';
import { TLS2K050CRUComponent } from './tls2k050-cru/tls2k050-cru.component';
import { TLS2K050Component } from './tls2k050/tls2k050.component';
import { TLS2K060CRUComponent } from './tls2k060-cru/tls2k060-cru.component';
import { TLS2K060Component } from './tls2k060/tls2k060.component';
import { Tls21030ModComponent } from './tls21030-mod/tls21030-mod.component';
import { TLS21040ModComponent } from './tls21040-mod/tls21040-mod.component';
import { TLS24010ModComponent } from './tls24010-mod/tls24010-mod.component';
import { TLS25010ModComponent } from './tls25010-mod/tls25010-mod.component';
import { TLS25020ModComponent } from './tls25020-mod/tls25020-mod.component';
import { TLS25030ModComponent } from './tls25030-mod/tls25030-mod.component';
import { TLS26040ModComponent } from './tls26040-mod/tls26040-mod.component';

@NgModule({
  declarations: [
    TLS21010Component,
    TLS21020Component,
    TLS21030Component,
    TLS21040Component,
    TLS21050Component,
    TLS22010Component,
    TLS22020Component,
    TLS22030Component,
    TLS22040Component,
    TLS23010Component,
    TLS23020Component,
    TLS23030Component,
    TLS23040Component,
    TLS23050Component,
    TLS23060Component,
    TLS23070Component,
    TLS23080Component,
    TLS23090Component,
    TLS23100Component,
    TLS23110Component,
    TLS23120Component,
    TLS23130Component,
    TLS23140Component,
    TLS24010Component,
    TLS24020Component,
    TLS24030Component,
    TLS24040Component,
    TLS24050Component,
    TLS24060Component,
    TLS24070Component,
    TLS24080Component,
    TLS25010Component,
    TLS25020Component,
    TLS25030Component,
    TLS26010Component,
    TLS26020Component,
    TLS26030Component,
    TLS26040Component,
    TLS27010Component,
    TLS27020Component,
    TLS27030Component,
    TLS27040Component,
    TLS27050Component,
    TLS28010Component,
    TLS28020Component,
    TLS28030Component,
    TLS28040Component,
    TLS28050Component,
    TLS29010Component,
    TLS2A010Component,
    TLS2A020Component,
    TLS2A030Component,
    TLS2A040Component,
    TLS2A050Component,
    TLS2B010Component,
    TLS2B020Component,
    TLS2B030Component,
    TLS2C010Component,
    TLS2C020Component,
    TLS2C030Component,
    TLS2C040Component,
    TLS2C050Component,
    TLS2D010Component,
    TLS2D020Component,
    TLS2D030Component,
    TLS2D040Component,
    TLS2D050Component,
    TLS2D060Component,
    TLS2D070Component,
    TLS2E010Component,
    TLS2E020Component,
    TLS2E030Component,
    TLS2E040Component,
    TLS2E050Component,
    TLS2E060Component,
    TLS2E070Component,
    TLS2E080Component,
    TLS2E090Component,
    TLS2E100Component,
    TLS2F010Component,
    TLS2F020Component,
    TLS2F030Component,
    TLS2G010Component,
    TLS2G020Component,
    TLS2G030Component,
    TLS2G040Component,
    TLS2H010Component,
    TLS2H020Component,
    TLS2H030Component,
    TLS2J010Component,
    TLS2J020Component,
    TLS2J030Component,
    TLS2J040Component,
    TLS2J050Component,
    TLS2J060Component,
    TLS2J070Component,
    TLS2K010Component,
    TLS2K020Component,
    TLS2K030Component,
    TLS2K040Component,
    TLS2K050Component,
    TLS2K060Component,
    TLS21010CRUComponent,
    TLS21020CRUComponent,
    TLS21030CRUComponent,
    TLS21040CRUComponent,
    TLS21050CRUComponent,
    TLS22010CRUComponent,
    TLS22020CRUComponent,
    TLS24010CRUComponent,
    TLS24020CRUComponent,
    TLS24030CRUComponent,
    TLS24040CRUComponent,
    TLS24050CRUComponent,
    TLS24060CRUComponent,
    TLS24070CRUComponent,
    TLS24080CRUComponent,
    TLS25010CRUComponent,
    TLS25020CRUComponent,
    TLS25030CRUComponent,
    TLS26010CRUComponent,
    TLS26020CRUComponent,
    TLS26030CRUComponent,
    TLS26040CRUComponent,
    TLS27010CRUComponent,
    TLS27020CRUComponent,
    TLS27030CRUComponent,
    TLS27040CRUComponent,
    TLS27050CRUComponent,
    TLS28010CRUComponent,
    TLS28020CRUComponent,
    TLS28030CRUComponent,
    TLS28040CRUComponent,
    TLS28050CRUComponent,
    TLS29010CRUComponent,
    TLS2A010CRUComponent,
    TLS2A020CRUComponent,
    TLS2A030CRUComponent,
    TLS2A040CRUComponent,
    TLS2A050CRUComponent,
    TLS2B010CRUComponent,
    TLS2B020CRUComponent,
    TLS2B030CRUComponent,
    TLS2C010CRUComponent,
    TLS2C020CRUComponent,
    TLS2C030CRUComponent,
    TLS2C040CRUComponent,
    TLS2C050CRUComponent,
    TLS2D010CRUComponent,
    TLS2D020CRUComponent,
    TLS2D030CRUComponent,
    TLS2D040CRUComponent,
    TLS2D050CRUComponent,
    TLS2D060CRUComponent,
    TLS2D070CRUComponent,
    TLS2E010CRUComponent,
    TLS2E020CRUComponent,
    TLS2E030CRUComponent,
    TLS2E040CRUComponent,
    TLS2E050CRUComponent,
    TLS2E060CRUComponent,
    TLS2E070CRUComponent,
    TLS2E080CRUComponent,
    TLS2E090CRUComponent,
    TLS2E100CRUComponent,
    TLS2F010CRUComponent,
    TLS2F020CRUComponent,
    TLS2F030CRUComponent,
    TLS2G010CRUComponent,
    TLS2G020CRUComponent,
    TLS2G030CRUComponent,
    TLS2G040CRUComponent,
    TLS2H010CRUComponent,
    TLS2H020CRUComponent,
    TLS2H030CRUComponent,
    TLS2J010CRUComponent,
    TLS2J020CRUComponent,
    TLS2J030CRUComponent,
    TLS2J040CRUComponent,
    TLS2J050CRUComponent,
    TLS2J060CRUComponent,
    TLS2J070CRUComponent,
    TLS2K010CRUComponent,
    TLS2K020CRUComponent,
    TLS2K030CRUComponent,
    TLS2K040CRUComponent,
    TLS2K050CRUComponent,
    TLS2K060CRUComponent,
    Tls21030ModComponent,
    TLS21040ModComponent,
    TLS24010ModComponent,
    TLS25010ModComponent,
    TLS25020ModComponent,
    TLS25030ModComponent,
    TLS26040ModComponent
  ],
  imports: [
    CommonModule,
    TLS2000RoutingModule,
    SharedModule,
  ]
})
// 2.2 專櫃營運管理
export class TLS2000Module { }

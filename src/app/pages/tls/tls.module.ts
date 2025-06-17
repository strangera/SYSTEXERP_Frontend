import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TlsRoutingModule } from './tls-routing.module';
import { SharedModule } from '../../shared/shared.module';
// Component
import { TLS11010CRUComponent } from './tls11010-cru/tls11010-cru.component';
import { TLS11010Component } from './tls11010/tls11010.component';
import { TLS11020CRUComponent } from './tls11020-cru/tls11020-cru.component';
import { TLS11020Component } from './tls11020/tls11020.component';
import { TLS12010CRUComponent } from './tls12010-cru/tls12010-cru.component';
import { TLS12010Component } from './tls12010/tls12010.component';
import { TLS12020CRUComponent } from './tls12020-cru/tls12020-cru.component';
import { TLS12020Component } from './tls12020/tls12020.component';
import { TLS12030CRUComponent } from './tls12030-cru/tls12030-cru.component';
import { TLS12030Component } from './tls12030/tls12030.component';
import { TLS12040CRUComponent } from './tls12040-cru/tls12040-cru.component';
import { TLS12040Component } from './tls12040/tls12040.component';
import { TLS12050CRUComponent } from './tls12050-cru/tls12050-cru.component';
import { TLS12050Component } from './tls12050/tls12050.component';
import { TLS12060Component } from './tls12060/tls12060.component';
import { TLS12070Component } from './tls12070/tls12070.component';
import { TLS13010CRUComponent } from './tls13010-cru/tls13010-cru.component';
import { TLS13010Component } from './tls13010/tls13010.component';
import { TLS13020CRUComponent } from './tls13020-cru/tls13020-cru.component';
import { TLS13020Component } from './tls13020/tls13020.component';
import { TLS13030CRUComponent } from './tls13030-cru/tls13030-cru.component';
import { TLS13030Component } from './tls13030/tls13030.component';
import { TLS13040CRUComponent } from './tls13040-cru/tls13040-cru.component';
import { TLS13040Component } from './tls13040/tls13040.component';
import { TLS13050CRUComponent } from './tls13050-cru/tls13050-cru.component';
import { TLS13050Component } from './tls13050/tls13050.component';
import { TLS13060CRUComponent } from './tls13060-cru/tls13060-cru.component';
import { TLS13060Component } from './tls13060/tls13060.component';
import { TLS13070CRUComponent } from './tls13070-cru/tls13070-cru.component';
import { TLS13070Component } from './tls13070/tls13070.component';
import { TLS14010CRUComponent } from './tls14010-cru/tls14010-cru.component';
import { TLS14010Component } from './tls14010/tls14010.component';
import { TLS14020CRUComponent } from './tls14020-cru/tls14020-cru.component';
import { TLS14020Component } from './tls14020/tls14020.component';
import { TLS13010Next1Component } from './tls13010-next1/tls13010-next1.component';
import { TLS13010Next2Component } from './tls13010-next2/tls13010-next2.component';
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
import { TLS31010Component } from './tls31010/tls31010.component';
import { TLS31020Component } from './tls31020/tls31020.component';
import { TLS31030Component } from './tls31030/tls31030.component';
import { TLS31040Component } from './tls31040/tls31040.component';
import { TLS31050Component } from './tls31050/tls31050.component';
import { TLS31060Component } from './tls31060/tls31060.component';
import { TLS31070Component } from './tls31070/tls31070.component';
import { TLS31080Component } from './tls31080/tls31080.component';
import { TLS31090Component } from './tls31090/tls31090.component';
import { TLS32010Component } from './tls32010/tls32010.component';
import { TLS32020Component } from './tls32020/tls32020.component';
import { TLS32030Component } from './tls32030/tls32030.component';
import { TLS32040Component } from './tls32040/tls32040.component';
import { TLS32050Component } from './tls32050/tls32050.component';
import { TLS32060Component } from './tls32060/tls32060.component';
import { TLS41010CRUComponent } from './tls41010-cru/tls41010-cru.component';
import { TLS41010Component } from './tls41010/tls41010.component';
import { TLS41020CRUComponent } from './tls41020-cru/tls41020-cru.component';
import { TLS41020Component } from './tls41020/tls41020.component';
import { TLS41030CRUComponent } from './tls41030-cru/tls41030-cru.component';
import { TLS41030Component } from './tls41030/tls41030.component';
import { TLS41040CRUComponent } from './tls41040-cru/tls41040-cru.component';
import { TLS41040Component } from './tls41040/tls41040.component';
import { TLS41050CRUComponent } from './tls41050-cru/tls41050-cru.component';
import { TLS41050Component } from './tls41050/tls41050.component';
import { TLS41060CRUComponent } from './tls41060-cru/tls41060-cru.component';
import { TLS41060Component } from './tls41060/tls41060.component';
import { TLS42010CRUComponent } from './tls42010-cru/tls42010-cru.component';
import { TLS42010Component } from './tls42010/tls42010.component';
import { TLS42020CRUComponent } from './tls42020-cru/tls42020-cru.component';
import { TLS42020Component } from './tls42020/tls42020.component';
import { TLS43010CRUComponent } from './tls43010-cru/tls43010-cru.component';
import { TLS43010Component } from './tls43010/tls43010.component';
import { TLS43020CRUComponent } from './tls43020-cru/tls43020-cru.component';
import { TLS43020Component } from './tls43020/tls43020.component';
import { TLS43030CRUComponent } from './tls43030-cru/tls43030-cru.component';
import { TLS43030Component } from './tls43030/tls43030.component';
import { TLS43040CRUComponent } from './tls43040-cru/tls43040-cru.component';
import { TLS43040Component } from './tls43040/tls43040.component';
import { TLS43050CRUComponent } from './tls43050-cru/tls43050-cru.component';
import { TLS43050Component } from './tls43050/tls43050.component';
import { TLS44010CRUComponent } from './tls44010-cru/tls44010-cru.component';
import { TLS44010Component } from './tls44010/tls44010.component';
import { TLS44020CRUComponent } from './tls44020-cru/tls44020-cru.component';
import { TLS44020Component } from './tls44020/tls44020.component';
import { TLS45010CRUComponent } from './tls45010-cru/tls45010-cru.component';
import { TLS45010Component } from './tls45010/tls45010.component';
import { TLS45020CRUComponent } from './tls45020-cru/tls45020-cru.component';
import { TLS45020Component } from './tls45020/tls45020.component';
import { TLS45030CRUComponent } from './tls45030-cru/tls45030-cru.component';
import { TLS45030Component } from './tls45030/tls45030.component';
import { TLS46010CRUComponent } from './tls46010-cru/tls46010-cru.component';
import { TLS46010Component } from './tls46010/tls46010.component';
import { TLS46020CRUComponent } from './tls46020-cru/tls46020-cru.component';
import { TLS46020Component } from './tls46020/tls46020.component';
import { TLS46030CRUComponent } from './tls46030-cru/tls46030-cru.component';
import { TLS46030Component } from './tls46030/tls46030.component';
import { TLS46040CRUComponent } from './tls46040-cru/tls46040-cru.component';
import { TLS46040Component } from './tls46040/tls46040.component';
import { TLS46050CRUComponent } from './tls46050-cru/tls46050-cru.component';
import { TLS46050Component } from './tls46050/tls46050.component';
import { TLS46060CRUComponent } from './tls46060-cru/tls46060-cru.component';
import { TLS46060Component } from './tls46060/tls46060.component';
import { TLS47010CRUComponent } from './tls47010-cru/tls47010-cru.component';
import { TLS47010Component } from './tls47010/tls47010.component';
import { TLS51010CRUComponent } from './tls51010-cru/tls51010-cru.component';
import { TLS51010Component } from './tls51010/tls51010.component';
import { TLS51020CRUComponent } from './tls51020-cru/tls51020-cru.component';
import { TLS51020Component } from './tls51020/tls51020.component';
import { TLS51030CRUComponent } from './tls51030-cru/tls51030-cru.component';
import { TLS51030Component } from './tls51030/tls51030.component';
import { TLS51040CRUComponent } from './tls51040-cru/tls51040-cru.component';
import { TLS51040Component } from './tls51040/tls51040.component';
import { TLS51050CRUComponent } from './tls51050-cru/tls51050-cru.component';
import { TLS51050Component } from './tls51050/tls51050.component';
import { TLS51060CRUComponent } from './tls51060-cru/tls51060-cru.component';
import { TLS51060Component } from './tls51060/tls51060.component';
import { TLS51070CRUComponent } from './tls51070-cru/tls51070-cru.component';
import { TLS51070Component } from './tls51070/tls51070.component';
import { TLS51080CRUComponent } from './tls51080-cru/tls51080-cru.component';
import { TLS51080Component } from './tls51080/tls51080.component';
import { TLS51090CRUComponent } from './tls51090-cru/tls51090-cru.component';
import { TLS51090Component } from './tls51090/tls51090.component';
import { TLS51100CRUComponent } from './tls51100-cru/tls51100-cru.component';
import { TLS51100Component } from './tls51100/tls51100.component';
import { TLS51110CRUComponent } from './tls51110-cru/tls51110-cru.component';
import { TLS51110Component } from './tls51110/tls51110.component';
import { TLS51120CRUComponent } from './tls51120-cru/tls51120-cru.component';
import { TLS51120Component } from './tls51120/tls51120.component';
import { TLS51130CRUComponent } from './tls51130-cru/tls51130-cru.component';
import { TLS51130Component } from './tls51130/tls51130.component';
import { TLS52010CRUComponent } from './tls52010-cru/tls52010-cru.component';
import { TLS52010Component } from './tls52010/tls52010.component';
import { TLS52020CRUComponent } from './tls52020-cru/tls52020-cru.component';
import { TLS52020Component } from './tls52020/tls52020.component';
import { TLS52030CRUComponent } from './tls52030-cru/tls52030-cru.component';
import { TLS52030Component } from './tls52030/tls52030.component';
import { TLS52040CRUComponent } from './tls52040-cru/tls52040-cru.component';
import { TLS52040Component } from './tls52040/tls52040.component';
import { TLS52050CRUComponent } from './tls52050-cru/tls52050-cru.component';
import { TLS52050Component } from './tls52050/tls52050.component';
import { TLS52060CRUComponent } from './tls52060-cru/tls52060-cru.component';
import { TLS52060Component } from './tls52060/tls52060.component';
import { TLS52070CRUComponent } from './tls52070-cru/tls52070-cru.component';
import { TLS52070Component } from './tls52070/tls52070.component';
import { TLS53010CRUComponent } from './tls53010-cru/tls53010-cru.component';
import { TLS53010Component } from './tls53010/tls53010.component';
import { TLS53020CRUComponent } from './tls53020-cru/tls53020-cru.component';
import { TLS53020Component } from './tls53020/tls53020.component';
import { TLS53030CRUComponent } from './tls53030-cru/tls53030-cru.component';
import { TLS53030Component } from './tls53030/tls53030.component';
import { TLS53040CRUComponent } from './tls53040-cru/tls53040-cru.component';
import { TLS53040Component } from './tls53040/tls53040.component';
import { TLS54010CRUComponent } from './tls54010-cru/tls54010-cru.component';
import { TLS54010Component } from './tls54010/tls54010.component';
import { TLS55010CRUComponent } from './tls55010-cru/tls55010-cru.component';
import { TLS55010Component } from './tls55010/tls55010.component';
import { TLS55020CRUComponent } from './tls55020-cru/tls55020-cru.component';
import { TLS55020Component } from './tls55020/tls55020.component';
import { TLS55030CRUComponent } from './tls55030-cru/tls55030-cru.component';
import { TLS55030Component } from './tls55030/tls55030.component';
import { TLS55040CRUComponent } from './tls55040-cru/tls55040-cru.component';
import { TLS55040Component } from './tls55040/tls55040.component';
import { TLS55050CRUComponent } from './tls55050-cru/tls55050-cru.component';
import { TLS55050Component } from './tls55050/tls55050.component';
import { TLS55060CRUComponent } from './tls55060-cru/tls55060-cru.component';
import { TLS55060Component } from './tls55060/tls55060.component';
import { TLS56010CRUComponent } from './tls56010-cru/tls56010-cru.component';
import { TLS56010Component } from './tls56010/tls56010.component';
import { TLS56020CRUComponent } from './tls56020-cru/tls56020-cru.component';
import { TLS56020Component } from './tls56020/tls56020.component';
import { TLS56030CRUComponent } from './tls56030-cru/tls56030-cru.component';
import { TLS56030Component } from './tls56030/tls56030.component';
import { TLS56040CRUComponent } from './tls56040-cru/tls56040-cru.component';
import { TLS56040Component } from './tls56040/tls56040.component';
import { TLS56050CRUComponent } from './tls56050-cru/tls56050-cru.component';
import { TLS56050Component } from './tls56050/tls56050.component';
import { TLS56060CRUComponent } from './tls56060-cru/tls56060-cru.component';
import { TLS56060Component } from './tls56060/tls56060.component';
import { TLS56070CRUComponent } from './tls56070-cru/tls56070-cru.component';
import { TLS56070Component } from './tls56070/tls56070.component';
import { TLS56080CRUComponent } from './tls56080-cru/tls56080-cru.component';
import { TLS56080Component } from './tls56080/tls56080.component';
import { TLS57010Component } from './tls57010/tls57010.component';
import { TLS57020Component } from './tls57020/tls57020.component';
import { TLS57030Component } from './tls57030/tls57030.component';
import { TLS57040Component } from './tls57040/tls57040.component';
import { TLS57050Component } from './tls57050/tls57050.component';
import { TLS57060Component } from './tls57060/tls57060.component';
import { TLS57070Component } from './tls57070/tls57070.component';
import { TLS57080Component } from './tls57080/tls57080.component';
import { TLS57090Component } from './tls57090/tls57090.component';
import { TLS57100Component } from './tls57100/tls57100.component';
import { TLS57110Component } from './tls57110/tls57110.component';
import { TLS57120Component } from './tls57120/tls57120.component';
import { TLS57130Component } from './tls57130/tls57130.component';
import { TLS57140Component } from './tls57140/tls57140.component';
import { TLS57150Component } from './tls57150/tls57150.component';
import { TLS57160Component } from './tls57160/tls57160.component';
import { TLS57170Component } from './tls57170/tls57170.component';
import { Tls13010Next3Component } from './tls13010-next3/tls13010-next3.component';
import { TLS23010CRUComponent } from './tls23010-cru/tls23010-cru.component';

@NgModule({
  declarations: [
    TLS11010Component,
    TLS11020Component,
    TLS12010Component,
    TLS12020Component,
    TLS12030Component,
    TLS12040Component,
    TLS12050Component,
    TLS12060Component,
    TLS12070Component,
    TLS13010Component,
    TLS13020Component,
    TLS13030Component,
    TLS13040Component,
    TLS13050Component,
    TLS13060Component,
    TLS13070Component,
    TLS14010Component,
    TLS14020Component,
    TLS11010CRUComponent,
    TLS11020CRUComponent,
    TLS12010CRUComponent,
    TLS12020CRUComponent,
    TLS12030CRUComponent,
    TLS12040CRUComponent,
    TLS12050CRUComponent,
    TLS13010CRUComponent,
    TLS13020CRUComponent,
    TLS13030CRUComponent,
    TLS13040CRUComponent,
    TLS13050CRUComponent,
    TLS13060CRUComponent,
    TLS13070CRUComponent,
    TLS14010CRUComponent,
    TLS14020CRUComponent,
    TLS13010Next1Component,
    TLS13010Next2Component,
    Tls13010Next3Component,
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
    TLS23010CRUComponent,
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
    TLS26040ModComponent,
    TLS31010Component,
    TLS31020Component,
    TLS31030Component,
    TLS31040Component,
    TLS31050Component,
    TLS31060Component,
    TLS31070Component,
    TLS31080Component,
    TLS31090Component,
    TLS32010Component,
    TLS32020Component,
    TLS32030Component,
    TLS32040Component,
    TLS32050Component,
    TLS32060Component,
    TLS41010Component,
    TLS41020Component,
    TLS41030Component,
    TLS41040Component,
    TLS41050Component,
    TLS41060Component,
    TLS42010Component,
    TLS42020Component,
    TLS43010Component,
    TLS43020Component,
    TLS43030Component,
    TLS43040Component,
    TLS43050Component,
    TLS44010Component,
    TLS44020Component,
    TLS45010Component,
    TLS45020Component,
    TLS45030Component,
    TLS46010Component,
    TLS46020Component,
    TLS46030Component,
    TLS46040Component,
    TLS46050Component,
    TLS46060Component,
    TLS47010Component,
    TLS41010CRUComponent,
    TLS41020CRUComponent,
    TLS41030CRUComponent,
    TLS41040CRUComponent,
    TLS41050CRUComponent,
    TLS41060CRUComponent,
    TLS42010CRUComponent,
    TLS42020CRUComponent,
    TLS43010CRUComponent,
    TLS43020CRUComponent,
    TLS43030CRUComponent,
    TLS43040CRUComponent,
    TLS43050CRUComponent,
    TLS44010CRUComponent,
    TLS44020CRUComponent,
    TLS45010CRUComponent,
    TLS45020CRUComponent,
    TLS45030CRUComponent,
    TLS46010CRUComponent,
    TLS46020CRUComponent,
    TLS46030CRUComponent,
    TLS46040CRUComponent,
    TLS46050CRUComponent,
    TLS46060CRUComponent,
    TLS47010CRUComponent,
    TLS51010Component,
    TLS51020Component,
    TLS51030Component,
    TLS51040Component,
    TLS51050Component,
    TLS51060Component,
    TLS51070Component,
    TLS51080Component,
    TLS51090Component,
    TLS51100Component,
    TLS51110Component,
    TLS51120Component,
    TLS51130Component,
    TLS52010Component,
    TLS52020Component,
    TLS52030Component,
    TLS52040Component,
    TLS52050Component,
    TLS52060Component,
    TLS52070Component,
    TLS53010Component,
    TLS53020Component,
    TLS53030Component,
    TLS53040Component,
    TLS54010Component,
    TLS55010Component,
    TLS55020Component,
    TLS55030Component,
    TLS55040Component,
    TLS55050Component,
    TLS55060Component,
    TLS56010Component,
    TLS56020Component,
    TLS56030Component,
    TLS56040Component,
    TLS56050Component,
    TLS56060Component,
    TLS56070Component,
    TLS56080Component,
    TLS57010Component,
    TLS57020Component,
    TLS57030Component,
    TLS57040Component,
    TLS57050Component,
    TLS57060Component,
    TLS57070Component,
    TLS57080Component,
    TLS57090Component,
    TLS57100Component,
    TLS57110Component,
    TLS57120Component,
    TLS57130Component,
    TLS57140Component,
    TLS57150Component,
    TLS57160Component,
    TLS57170Component,
    TLS51010CRUComponent,
    TLS51020CRUComponent,
    TLS51030CRUComponent,
    TLS51040CRUComponent,
    TLS51050CRUComponent,
    TLS51060CRUComponent,
    TLS51070CRUComponent,
    TLS51080CRUComponent,
    TLS51090CRUComponent,
    TLS51100CRUComponent,
    TLS51110CRUComponent,
    TLS51120CRUComponent,
    TLS51130CRUComponent,
    TLS52010CRUComponent,
    TLS52020CRUComponent,
    TLS52030CRUComponent,
    TLS52040CRUComponent,
    TLS52050CRUComponent,
    TLS52060CRUComponent,
    TLS52070CRUComponent,
    TLS53010CRUComponent,
    TLS53020CRUComponent,
    TLS53030CRUComponent,
    TLS53040CRUComponent,
    TLS54010CRUComponent,
    TLS55010CRUComponent,
    TLS55020CRUComponent,
    TLS55030CRUComponent,
    TLS55040CRUComponent,
    TLS55050CRUComponent,
    TLS55060CRUComponent,
    TLS56010CRUComponent,
    TLS56020CRUComponent,
    TLS56030CRUComponent,
    TLS56040CRUComponent,
    TLS56050CRUComponent,
    TLS56060CRUComponent,
    TLS56070CRUComponent,
    TLS56080CRUComponent,
  ],
  imports: [
    CommonModule,
    TlsRoutingModule,
    SharedModule
  ]
})
export class TlsModule { }

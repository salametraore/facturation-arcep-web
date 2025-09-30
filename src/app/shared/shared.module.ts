import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FooterComponent} from './components/footer/footer.component';
import {MaterialModule} from '../material/material.module';
import {RouterModule} from '@angular/router';
import {DefaultComponent} from './components/default/default.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import {ReactiveFormsModule} from '@angular/forms';
import {SuccessDialogComponent} from './dialogs/success-dialog/success-dialog.component';
import {ErrorsDialogComponent} from './dialogs/errors-dialog/errors-dialog.component';
import {AlerteDialogComponent} from './dialogs/alerte-dialog/alerte-dialog.component';
import {YesNoComponent} from './dialogs/yes-no/yes-no.component';
import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MainNavComponent } from './components/main-nav/main-nav.component';
import { PdfComponent } from './components/pdf/pdf.component';
import {PdfViewerModule} from 'ng2-pdf-viewer';
import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';
import { ThousandsSeparatorDirective } from './directive/thousands-separator.directive';
import {FlexLayoutModule} from "@ngbracket/ngx-layout";
import {MatGridList, MatGridTile} from "@angular/material/grid-list";
import {Periode} from "./pipes/periode";
import {SearchPipe} from "./pipes/search.pipe";
@NgModule({
  declarations: [
    FooterComponent,
    DefaultComponent,
    NotFoundComponent,
    SuccessDialogComponent,
    ErrorsDialogComponent,
    AlerteDialogComponent,
    YesNoComponent,
    MainNavComponent,
    PdfComponent,
    ThousandSeparatorPipe,
    ThousandsSeparatorDirective,
    Periode,
    SearchPipe,
  ],
  imports: [
    CommonModule,
    MaterialModule,
    RouterModule,
    ReactiveFormsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    PdfViewerModule,
    FlexLayoutModule,
    MatGridList,
    MatGridTile,
  ],
  exports: [
    FooterComponent,
    MaterialModule,
    DefaultComponent,
    NotFoundComponent,
    PdfComponent,
    ThousandSeparatorPipe,
    ThousandsSeparatorDirective,
    FlexLayoutModule,
    MatGridList,
    MatGridTile,
    SearchPipe,
  ],
})
export class SharedModule {
}

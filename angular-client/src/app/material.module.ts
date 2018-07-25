import { NgModule } from '@angular/core';

import {
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatListModule,
    MatSidenavModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSnackBarModule,
    MatRadioModule,
    MatExpansionModule
} from '@angular/material';

const materialModules = [  
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatMenuModule,
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    MatSelectModule,
    MatListModule,
    MatSidenavModule,
    MatGridListModule,
    MatCheckboxModule,
    MatSliderModule,
    MatSnackBarModule,
    MatRadioModule,
    MatExpansionModule
]

@NgModule({
    imports: [
        materialModules
    ],
    exports: [
        materialModules
    ]
})

export class MaterialModule {}

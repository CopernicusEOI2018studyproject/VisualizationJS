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
    MatSnackBarModule
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
    MatSnackBarModule
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

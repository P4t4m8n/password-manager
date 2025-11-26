import { Component } from '@angular/core';
import { BackButton } from "../../../../core/components/back-button/back-button";
import { PasswordGenerator } from "../../components/password-generator/password-generator";

@Component({
  selector: 'app-password-generator-page',
  imports: [BackButton, PasswordGenerator],
  templateUrl: './password-generator-page.html',
  styleUrl: './password-generator-page.css',
})
export class PasswordGeneratorPage {

}

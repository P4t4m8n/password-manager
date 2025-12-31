import { Component } from '@angular/core';
import { PasswordGenerator } from "../../components/password-generator/password-generator";
import { Header } from "../../../../core/layout/header/header";

@Component({
  selector: 'app-password-generator-page',
  imports: [ PasswordGenerator, Header],
  templateUrl: './password-generator-page.html',
  styleUrl: './password-generator-page.css',
})
export class PasswordGeneratorPage {

}

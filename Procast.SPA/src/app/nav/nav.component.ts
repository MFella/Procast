import { Component, OnInit } from '@angular/core';
import {AuthService} from "../auth/auth.service";
import {MessageService} from "../_services/message.service";
import {Router} from "@angular/router";

@Component({
  selector: 'pc-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent implements OnInit {

  constructor(
    private readonly authService: AuthService,
    private readonly messageService: MessageService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
  }

  logoutUser(): void {
    this.authService.logout();
    this.router.navigate(['home']);
    this.messageService.notify('PC_AUTH_LOGOUT_INFO_MESSAGE', 'info');
  }

  isUserLoggedIn(): boolean {
    return this.authService.isUserLoggedIn();
  }

}

import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    public errMsg = '';

    checkoutForm = this.formBuilder.group({
        username: '',
        password: ''
    });

    constructor(
        private formBuilder: UntypedFormBuilder,
        private http: HttpClient,
        private router: Router,
    ) { }

    ngOnInit(): void {
        localStorage.removeItem("currentUser");
        if (!localStorage.getItem('foo')) {
            localStorage.setItem('foo', 'no reload');
            location.reload();
        }
        else {
            localStorage.removeItem('foo');
        }
        this.defaultAdminCreated();
    }

    onSubmit(): void {
        console.log("Username: " + this.checkoutForm.value['username'] + " | Password: " + this.checkoutForm.value['password']);

        let payload = {
            username: this.checkoutForm.value['username'],
            password: this.checkoutForm.value['password'],
        }

        this.http.post<any>('http://localhost:8080/api/login/', payload, { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: data => {
                this.errMsg = "";
                localStorage.setItem('currentUser', JSON.stringify(data['user']));
                this.router.navigate(['./dashboard']);
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }

    defaultAdminCreated(): void {
        this.http.get<any>('http://localhost:8080/api/defaultAdminCreated', { headers: new HttpHeaders({ "Access-Control-Allow-Headers": "Content-Type" }) }).subscribe({
            next: defaultAdminCreated => {
                this.errMsg = "";
                if (defaultAdminCreated) {
                    alert("The default admin account has been created because there are no registered admins.");
                }
            },
            error: error => {
                this.errMsg = error['error']['message'];
            }
        });
    }
}

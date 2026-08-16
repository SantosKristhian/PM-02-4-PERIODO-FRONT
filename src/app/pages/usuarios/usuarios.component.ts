import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuariosService } from '../../services/usuarios.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../../shared/services/notification.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  private notification = inject(NotificationService);

  usuarios: any[] = [];
  novo = { nome: '', cpf: '', idade: 18, login: '', senha: '', cargo: 'VENDEDOR' };
  loading = false;
  error: string | null = null;

  cargos = [ 'ADM', 'VENDEDOR' ];

  constructor(private usuariosService: UsuariosService, private http: HttpClient) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.usuariosService.listar().subscribe({
      next: data => { this.usuarios = data || []; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  criar() {
    if (!this.novo.nome || !this.novo.cpf || !this.novo.login || !this.novo.senha) {
      this.notification.warning('Preencha todos os campos obrigatórios');
      return;
    }
    const payload = {
      nome: this.novo.nome,
      cpf: this.novo.cpf,
      idade: this.novo.idade,
      login: this.novo.login,
      senha: this.novo.senha,
      cargo: this.novo.cargo
    };

    this.http.post(`${environment.SERVIDOR}/user/save`, payload).subscribe({
      next: () => {
        this.notification.success('Usuário criado com sucesso!');
        this.novo = { nome: '', cpf: '', idade: 18, login: '', senha: '', cargo: 'VENDEDOR' };
        this.load();
      },
      error: err => console.error('Erro criar usuario', err)
    });
  }

}
// primeiro-acesso.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UsuariosService } from '../services/usuarios.service';

@Component({
  selector: 'app-primeiro-acesso',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './primeiro-acesso.component.html',
  styleUrls: ['./primeiro-acesso.component.css']
})
export class PrimeiroAcessoComponent implements OnInit {
  adminForm: FormGroup;
  loading = false;
  mensagemErro = '';

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private router: Router
  ) {
    this.adminForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cpf: ['', [Validators.required, Validators.minLength(11)]],
      idade: ['', [Validators.required, Validators.min(18)]],
      login: ['', [Validators.required, Validators.minLength(3)]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      confirmarSenha: ['', Validators.required]
    }, { validators: this.senhasIguais });
  }

  ngOnInit(): void {
    // Verifica se já existem usuários
    this.usuariosService.existemUsuarios().subscribe(existem => {
      if (existem) {
        this.router.navigate(['/login']);
      }
    });
  }

  senhasIguais(group: FormGroup) {
    const senha = group.get('senha')?.value;
    const confirmarSenha = group.get('confirmarSenha')?.value;
    return senha === confirmarSenha ? null : { senhasDiferentes: true };
  }

  criarAdministrador() {
    if (this.adminForm.invalid) {
      this.mensagemErro = 'Preencha todos os campos corretamente';
      return;
    }

    this.loading = true;
    this.mensagemErro = '';

    const novoAdmin = {
      ...this.adminForm.value,
      cargo: 'ADM',
      ativo: true
    };

    delete novoAdmin.confirmarSenha;

    this.usuariosService.criarUsuario(novoAdmin).subscribe({
      next: () => {
        alert('✅ Administrador criado com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || 'Erro ao criar administrador';
      }
    });
  }
}
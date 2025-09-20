import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // necessário para *ngFor, *ngIf
import { Router } from '@angular/router';
import { ProdutosService } from '../../../../../app/core/services/produtos.service';
import { Produto } from '../../../../models/produto';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule // necessário para *ngFor, *ngIf
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  produtos: Produto[] = [];

  constructor(
    private produtosService: ProdutosService,
    private router: Router // caso queira usar navegação futuramente
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (dados) => {
        this.produtos = dados;
        console.log('Produtos carregados:', this.produtos);
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ProdutosService } from '../../../../../app/core/services/produtos.service';
import { Produto } from'../../../../models/produto';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule, // necessário para *ngFor, *ngIf etc.
    CurrencyPipe
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'] // <-- arrumei o nome (era styleUrl)
})
export class ListComponent implements OnInit {
  produtos: Produto[] = [];

  constructor(private produtosService: ProdutosService) {}

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

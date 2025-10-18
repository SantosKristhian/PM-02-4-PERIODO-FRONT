import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriasService, Categoria } from '../../services/categorias.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-categorias-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss']
})
export class CategoriasListComponent implements OnInit {
  categorias: Categoria[] = [];
  mostrarForm: boolean = false;

  novaCategoria: Categoria = { id: 0, nome: '' };
  categoriaEditando: Categoria | null = null;

  constructor(
    private categoriasService: CategoriasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarCategorias();
  }

  // Navegar para categorias (se necessário)
  irParaCategorias(): void {
    this.router.navigate(['/categorias']);
  }

  // Listar categorias
  carregarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: dados => this.categorias = dados,
      error: erro => console.error('Erro ao carregar categorias:', erro)
    });
  }

  // Criar nova categoria
  criarCategoria(): void {
    const nome = this.novaCategoria.nome.trim();
    if (!nome) return;

    this.categoriasService.adicionar(nome).subscribe({
      next: () => {
        this.carregarCategorias();
        this.novaCategoria.nome = '';
        this.mostrarForm = false;
      },
      error: erro => console.error('Erro ao adicionar categoria:', erro)
    });
  }

  // Iniciar edição
  editar(categoria: Categoria): void {
    this.categoriaEditando = { ...categoria }; // copia para evitar mutação direta
  }

  // Salvar edição
  salvarEdicao(): void {
    if (!this.categoriaEditando) return;

    this.categoriasService.editar(this.categoriaEditando).subscribe({
      next: () => {
        this.carregarCategorias();
        this.categoriaEditando = null;
      },
      error: erro => console.error('Erro ao editar categoria:', erro)
    });
  }

  // Cancelar edição
  cancelarEdicao(): void {
    this.categoriaEditando = null;
  }

  // Remover categoria
  removerCategoria(id: number): void {
    if (!confirm('Deseja realmente excluir esta categoria?')) return;

    this.categoriasService.remover(id).subscribe({
      next: () => this.carregarCategorias(),
      error: erro => {
        console.error('Erro ao remover categoria:', erro);
        alert('Não foi possível remover a categoria. Ela pode estar vinculada a produtos.');
      }
    });
  }
}

import { Component, OnInit , AfterContentChecked} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';

import { switchMap } from 'rxjs/operators';

import toastr from "toastr";

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent implements OnInit, AfterContentChecked {

  //propriedades
  currentAction: string; // edit ou new
  categoryForm: FormGroup;
  pageTitle: string;  // editar ou criar
  serverErrorMessages: string[] = null; // mensagens retornadas do servidor
  submittingForm: boolean = false; // para evitar várias submissões seguidas
  category: Category = new Category(); // inicializa objeto category vazio

  constructor(
    //injeção de dependências
    private categoryService: CategoryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit() {
    //métodos
    this.setCurrentAction();
    this.buildCategoryForm();
    this.loadCategory();
  }

  ngAfterContentChecked(){
    // método que seta o titulo da página somente depois que o conteúdo for carregado
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true; // desbloqueia o botão para submissão do formulário

    if(this.currentAction == "new"){
      this.createCategory();
    }
    else{
      // currentAction == "edit"
      this.updateCategory();
    }
  }

  // métodos privados

  private setCurrentAction(){
    if(this.route.snapshot.url[0].path == "new") // carrega o array com o caminho da requisição
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  private buildCategoryForm(){
    this.categoryForm = this.formBuilder.group({
      id:[null],
      name:[null, [Validators.required, Validators.minLength(2)]], // define q o campo é obrigatório e q tenha no mínimo 2 caracteres
      description:[null] 
    })
  }

  private loadCategory(){
    if (this.currentAction == "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.categoryService.getById(+params.get("id")))
      )
      .subscribe(
        (category) => {
          this.category = category;
          //setar os valores de edição para o formulario categoryForm, que está ainda vazio (binds loaded category data to categoryForm)
          this.categoryForm.patchValue(category)
        },
        (error) => alert('Ocorreu um erro no servidor. Tente novamente mais tarde.')
      )
    }

  }

  private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = 'Cadastro  de Nova Categoria'
    else{
      const categoryName = this.category.name || "" // porque "ou nulo?" -> o ngAfterContentChecked quando carregado pela primeira vez traz uma categoria vazia
      this.pageTitle = "Editando Categoria: "+ categoryName;
    }
  }

  private createCategory(){
    //cria um objeto novo e pega os valores informados no formulário
    const category: Category = Object.assign(new Category(), this.categoryForm.value);

    this.categoryService.create(category)
      .subscribe(
        category => this.actionsForSuccess(category),
        error => this.actionsForError(error)
      )

  }

  private updateCategory(){
     //cria um objeto novo e pega os valores informados no formulário
     const category: Category = Object.assign(new Category(), this.categoryForm.value);

     this.categoryService.update(category)
       .subscribe(
         category => this.actionsForSuccess(category),
         error => this.actionsForError(error)
       )
  }

  private actionsForSuccess(category: Category){
    toastr.success("Solicitação processada com sucesso");
    
    //forçar recarregamento do formulário para alterar rota de new para edit
    // redirect/reload component page
    this.router.navigateByUrl("categories", {skipLocationChange:true}).then(   // skipLocationChange: true não salva no histórico do navegador, evitando erros caso o usuário retorne depois de criar nova categoria
      () => this.router.navigate(["categories", category.id, "edit"])
    ) 

  }

  private actionsForError(error){
    toastr.erro("Ocorreu um erro ao processar a sua solicitação!")

    //para não submeter o formulário
    this.submittingForm = false;

    if(error.status === 442)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]

  }
}

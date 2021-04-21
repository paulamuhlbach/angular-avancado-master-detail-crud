import { Component, OnInit , AfterContentChecked} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";

import { Entry } from '../shared/entry.model';
import { EntryService } from '../shared/entry.service';
import { Category } from '../../categories/shared/category.model';
import { CategoryService } from '../../categories/shared/category.service';

import { switchMap } from 'rxjs/operators';

import toastr from "toastr";

@Component({
  selector: 'app-entry-form',
  templateUrl: './entry-form.component.html',
  styleUrls: ['./entry-form.component.css']
})
export class EntryFormComponent implements OnInit, AfterContentChecked {

  //propriedades
  currentAction: string; // edit ou new
  entryForm: FormGroup;
  pageTitle: string;  // editar ou criar
  serverErrorMessages: string[] = null; // mensagens retornadas do servidor
  submittingForm: boolean = false; // para evitar várias submissões seguidas
  entry: Entry = new Entry(); // inicializa objeto entry vazio
  categories: Array<Category>;

  imaskConfig = {
    mask: Number,
    scale: 2,
    thousandsSeparator:'', //separador de milhares
    padFractionalZeros: true, // adiciona um 0 no final, se alguém esqueceu. ex: 20,2 -> 20,20
    normalizeZeros:true,
    radix:',' //separador de decimais 
  };

  ptBR = {
    firstDayOfWeek: 0,
    dayNames: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
    dayNamesShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'],
    dayNamesMin: ['Do', 'Se', 'Te', 'Qu', 'Qu', 'Se', 'Sa'],
    monthNames: [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho',
      'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    monthNamesShort: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
    today: 'Hoje',
    clear: 'Limpar'
  };

  constructor(
    //injeção de dependências
    private entryService: EntryService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private categoryService: CategoryService
  ) { }

  ngOnInit() {
    //métodos
    this.setCurrentAction();
    this.buildEntryForm();
    this.loadEntry();
    this.loadCategories();
  }

  ngAfterContentChecked(){
    // método que seta o titulo da página somente depois que o conteúdo for carregado
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true; // desbloqueia o botão para submissão do formulário

    if(this.currentAction == "new"){
      this.createEntry();
    }
    else{
      // currentAction == "edit"
      this.updateEntry();
    }
  }

  get typeOptions(): Array<any>{
    return Object.entries(Entry.types).map(
      ([value, text]) => {
        return {
          text: text,
          value: value
        }
      }
    )
  }
  // métodos privados

  private setCurrentAction(){
    if(this.route.snapshot.url[0].path == "new") // carrega o array com o caminho da requisição
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  private buildEntryForm(){
    this.entryForm = this.formBuilder.group({
      id:[null],
      name:[null, [Validators.required, Validators.minLength(2)]], // define q o campo é obrigatório e q tenha no mínimo 2 caracteres
      description:[null],
      type: ["expense", [Validators.required]],
      amount:[null, [Validators.required]], 
      date:[null, [Validators.required]],
      paid:[true, [Validators.required]], 
      categoryId:[null, [Validators.required]]
    })
  }

  private loadEntry(){
    if (this.currentAction == "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.entryService.getById(+params.get("id")))
      )
      .subscribe(
        (entry) => {
          this.entry = entry;
          //setar os valores de edição para o formulario entryForm, que está ainda vazio (binds loaded entry data to entryForm)
          this.entryForm.patchValue(entry)
        },
        (error) => alert('Ocorreu um erro no servidor. Tente novamente mais tarde.')
      )
    }

  }

  private loadCategories(){
    this.categoryService.getAll().subscribe(
      categories => this.categories = categories
    );
  }
  private setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = 'Cadastro  de Novo Lançamento'
    else{
      const entryName = this.entry.name || "" // porque "ou nulo?" -> o ngAfterContentChecked quando carregado pela primeira vez traz uma categoria vazia
      this.pageTitle = "Editando Lançamento: "+ entryName;
    }
  }

  private createEntry(){
    //cria um objeto novo e pega os valores informados no formulário
    const entry: Entry = Entry.fromJson(this.entryForm.value)

    this.entryService.create(entry)
      .subscribe(
        entry => this.actionsForSuccess(entry),
        error => this.actionsForError(error)
      )

  }

  private updateEntry(){
     //cria um objeto novo e pega os valores informados no formulário
     const entry: Entry = Entry.fromJson(this.entryForm.value)

     this.entryService.update(entry)
       .subscribe(
         entry => this.actionsForSuccess(entry),
         error => this.actionsForError(error)
       )
  }

  private actionsForSuccess(entry: Entry){
    toastr.success("Solicitação processada com sucesso");
    
    //forçar recarregamento do formulário para alterar rota de new para edit
    // redirect/reload component page
    this.router.navigateByUrl("entries", {skipLocationChange:true}).then(   // skipLocationChange: true não salva no histórico do navegador, evitando erros caso o usuário retorne depois de criar nova categoria
      () => this.router.navigate(["entries", entry.id, "edit"])
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

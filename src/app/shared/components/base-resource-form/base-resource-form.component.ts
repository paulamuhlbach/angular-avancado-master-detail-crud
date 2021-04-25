import { OnInit , AfterContentChecked, Injector, Injectable} from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from 'rxjs/operators';

import toastr from "toastr";

@Injectable()
export abstract class BaseResourseFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

  //propriedades
  currentAction: string; // edit ou new
  resourceForm: FormGroup;
  pageTitle: string;  // editar ou criar
  serverErrorMessages: string[] = null; // mensagens retornadas do servidor
  submittingForm: boolean = false; // para evitar várias submissões seguidas

  protected route: ActivatedRoute;
  protected router: Router;
  protected formBuilder: FormBuilder;

  constructor(
    //injeção de dependências
    protected injector: Injector,
    public resource: T, // exemplo -> isso pode virar um new category()
    protected resourceService: BaseResourceService<T>,
    protected jsonDataToResourceFn: (jsonData) => T   // função recebe um jsonData e transforma em tipo T

  ) {
    this.route = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
    this.formBuilder = this.injector.get(FormBuilder);
   }

  ngOnInit() {
    //métodos
    this.setCurrentAction();
    this.buildResourceForm();
    this.loadResource();
  }

  ngAfterContentChecked(){
    // método que seta o titulo da página somente depois que o conteúdo for carregado
    this.setPageTitle();
  }

  submitForm(){
    this.submittingForm = true; // desbloqueia o botão para submissão do formulário

    if(this.currentAction == "new"){
      this.createResource();
    }
    else{
      // currentAction == "edit"
      this.updateResource();
    }
  }

  // métodos privados

  protected setCurrentAction(){
    if(this.route.snapshot.url[0].path == "new") // carrega o array com o caminho da requisição
      this.currentAction = "new"
    else
      this.currentAction = "edit"
  }

  

  protected loadResource(){
    if (this.currentAction == "edit"){
      this.route.paramMap.pipe(
        switchMap(params => this.resourceService.getById(+params.get("id")))
      )
      .subscribe(
        (resource) => {
          this.resource = resource;
          //setar os valores de edição para o formulario resourceForm, que está ainda vazio (binds loaded resource data to resourceForm)
          this.resourceForm.patchValue(resource)
        },
        (error) => alert('Ocorreu um erro no servidor. Tente novamente mais tarde.')
      )
    }

  }

  protected setPageTitle(){
    if(this.currentAction == 'new')
      this.pageTitle = this.creationPageTitle();
    else{
      this.pageTitle = this.editionPageTitle();
    }
  }

  protected creationPageTitle(): string{
    return "Novo";
  }

  protected editionPageTitle(): string{
    return "Edição";
  }

  protected createResource(){
    //cria um objeto novo e pega os valores informados no formulário
    const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

    this.resourceService.create(resource)
      .subscribe(
        resource => this.actionsForSuccess(resource),
        error => this.actionsForError(error)
      )

  }

  protected updateResource(){
     //cria um objeto novo e pega os valores informados no formulário
     const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);

     this.resourceService.update(resource)
       .subscribe(
        resource => this.actionsForSuccess(resource),
         error => this.actionsForError(error)
       )
  }

  protected actionsForSuccess(resource: T){
    toastr.success("Solicitação processada com sucesso");

    const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
    
    //forçar recarregamento do formulário para alterar rota de new para edit
    // redirect/reload component page
    this.router.navigateByUrl(baseComponentPath, {skipLocationChange:true}).then(   // skipLocationChange: true não salva no histórico do navegador, evitando erros caso o usuário retorne depois de criar nova categoria
      () => this.router.navigate([baseComponentPath, resource.id, "edit"])
    ) 

  }

  protected actionsForError(error){
    toastr.erro("Ocorreu um erro ao processar a sua solicitação!")

    //para não submeter o formulário
    this.submittingForm = false;

    if(error.status === 442)
      this.serverErrorMessages = JSON.parse(error._body).errors;
    else
      this.serverErrorMessages = ["Falha na comunicação com o servidor. Por favor, tente mais tarde."]

  }

  protected abstract buildResourceForm(): void;
}

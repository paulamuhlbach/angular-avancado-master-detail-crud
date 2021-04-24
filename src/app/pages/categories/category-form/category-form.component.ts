import { Component, Injector} from '@angular/core';
import { Validators } from '@angular/forms';

import { BaseResourseFormComponent } from '../../../shared/components/base-resource-form/base-resource-form.component';

import { Category } from '../shared/category.model';
import { CategoryService } from '../shared/category.service';


@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css']
})
export class CategoryFormComponent extends BaseResourseFormComponent<Category>{


  constructor(protected categoryService: CategoryService, protected injector: Injector) { 
    super(injector, new Category(), categoryService, Category.fromJson)
  }


  protected buildResourceForm(){
    this.resourceForm = this.formBuilder.group({
      id:[null],
      name:[null, [Validators.required, Validators.minLength(2)]], // define q o campo é obrigatório e q tenha no mínimo 2 caracteres
      description:[null] 
    })
  }

  protected creationPageTitle(): string{
    return "Cadastro de Nova Categoria";
  }

  protected editionPageTitle(): string{
    const categoryName = this.resource.name || "";
    return "Editando Categoria: " + categoryName;
  }
 
}

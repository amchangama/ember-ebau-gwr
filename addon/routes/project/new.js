import Route from "@ember/routing/route";
import { inject as service } from "@ember/service";
import ConstructionProject from "ember-ebau-gwr/models/construction-project";

export default class ProjectNewRoute extends Route {
  @service config;

  templateName = "project.form";
  controllerName = "project.form";

  model() {
    const project = new ConstructionProject();
    project.constructionLocalisation.municipalityId = this.config.municipalityId;
    project.constructionLocalisation.municipalityName = this.config.municipalityName;
    project.constructionLocalisation.cantonAbbreviation = this.config.cantonAbbreviation;
    return { project, instanceId: this.modelFor("application").id };
  }
}

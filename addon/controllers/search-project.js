import Controller from "@ember/controller";
import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { task, lastValue } from "ember-concurrency-decorators";
import { projectStatusOptions } from "ember-ebau-gwr/models/options";

export default class SearchProjectController extends Controller {
  @service constructionProject;
  @service intl;
  @service config;
  @service store;

  @tracked extendedSearch = false;
  @tracked validationErrors = {};

  projectStatusOptions = projectStatusOptions;

  @lastValue("search") searchResults;
  @task
  *search(query = {}) {
    query.constructionSurveyDept = this.config.constructionSurveyDept;
    return yield this.constructionProject.searchProject(query);
  }

  @action
  linkProject(eproid) {
    const link = this.store.createRecord("gwr-link", {
      eproid,
      localId: this.model.id,
    });
    link.save();
    this.transitionToRoute("project.index");
  }
}

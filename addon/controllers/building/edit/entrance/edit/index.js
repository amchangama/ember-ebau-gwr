import { action } from "@ember/object";
import { inject as service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { task, dropTask, lastValue } from "ember-concurrency-decorators";
import ImportController from "ember-ebau-gwr/controllers/import";
import Models from "ember-ebau-gwr/models";
import BuildingEntrance from "ember-ebau-gwr/models/building-entrance";
import BuildingEntranceValidations from "ember-ebau-gwr/validations/building-entrance";

export default class BuildingEditEntranceEditIndexController extends ImportController {
  importModelName = "buildingEntrance";
  Models = Models;
  BuildingEntranceValidations = BuildingEntranceValidations;
  BuildingEntrance = BuildingEntrance;

  @service("building-entrance") buildingEntranceAPI;
  @service building;
  @service intl;
  @service notification;
  @service router;
  @service config;

  @tracked errors;

  @lastValue("fetchBuildingEntrance") buildingEntrance;
  @task
  *fetchBuildingEntrance() {
    try {
      this.errors = [];
      yield this.fetchCalumaData.perform();
      if (this.model.buildingEntrance?.isNew) {
        return this.model.buildingEntrance;
      }
      const buildingEntrance = yield this.buildingEntranceAPI.getFromCacheOrApi(
        this.model.entranceId,
        this.model.buildingId
      );

      buildingEntrance.EGID = this.model.buildingId;
      return buildingEntrance;
    } catch (error) {
      console.error(error);
      this.notification.danger(
        this.intl.t("ember-gwr.buildingEntrance.loadingError")
      );
    }
  }

  @action
  cancelMerge() {
    this.resetImport();
    this.fetchBuildingEntrance.perform();
  }

  @dropTask
  *saveBuildingEntrance() {
    try {
      if (this.buildingEntrance.isNew) {
        const buildingEntrance = yield this.buildingEntranceAPI.create(
          this.buildingEntrance,
          this.model.buildingId
        );
        this.transitionToRoute(
          "building.edit.entrance.edit",
          buildingEntrance.EDID
        );
      } else {
        yield this.buildingEntranceAPI.update(
          this.buildingEntrance,
          this.model.buildingId
        );
      }
      // Ensure building entrance list is refreshed
      this.building.clearCache(this.model.buildingId);
      this.errors = [];
      this.notification.success(
        this.intl.t("ember-gwr.buildingEntrance.saveSuccess")
      );
    } catch (error) {
      // Throw specific error message for
      // mismatched locality - zip code errors
      this.errors =
        error[0] === this.BuildingEntrance.LOCALITY_ERROR
          ? [this.intl.t("ember-gwr.buildingEntrance.localityError")]
          : error;

      this.notification.danger(
        this.intl.t("ember-gwr.buildingEntrance.saveError")
      );
    }
  }

  get hasNoStreet() {
    return !this.buildingEntrance?.isNew && this.buildingEntrance?.street.isNew;
  }
}

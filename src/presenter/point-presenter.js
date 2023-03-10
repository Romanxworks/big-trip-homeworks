import {render, replace, remove} from '../framework/render.js';
import PointView from '../view/point-view.js';
import AddEditPointView from '../view/add-edit-point-view.js';
import {UserAction, UpdateType, Mode} from '../const.js';
import {isDateEqual} from '../utils/date.js';

export default class PointPresenter {
  #ponitListContainer = null;
  #pointComponent = null;
  #addEditComponent = null;
  #changeData = null;
  #changeMode = null;

  #point = null;
  #offers = null;
  #destinations = null;
  #sities = null;
  #mode = Mode.DEFAULT;

  constructor(ponitListContainer, changeData, changeMode){
    this.#ponitListContainer = ponitListContainer;
    this.#changeData = changeData;
    this.#changeMode = changeMode;
  }

  init = (point, offers, destinations, sities) => {
    this.#point = point;
    this.#offers = offers;
    this.#destinations = destinations;
    this.#sities = sities;

    const prevPointComponent = this.#pointComponent;
    const prevAddEditComponent = this.#addEditComponent;

    this.#pointComponent = new PointView(this.#point, this.#offers);
    this.#addEditComponent = new AddEditPointView(this.#offers, this.#destinations, this.#sities, this.#point);

    this.#pointComponent.setEditClickHandler(this.#handleEditClick);
    this.#pointComponent.setFavoriteClickHandler(this.#handleFavoriteClick);
    this.#addEditComponent.setFormSubmitHandler(this.#handleFormSubmit);
    this.#addEditComponent.setResetClickHandler(this.resetView);
    this.#addEditComponent.setDeleteClickHandler(this.#handleDeleteClick);

    if (prevPointComponent === null || prevAddEditComponent === null) {
      render(this.#pointComponent, this.#ponitListContainer);
      return;
    }

    if (this.#mode === Mode.DEFAULT) {
      replace(this.#pointComponent, prevPointComponent);
    }

    if (this.#mode === Mode.EDITING) {
      replace(this.#pointComponent, prevAddEditComponent);
      this.#mode = Mode.DEFAULT;
    }

    remove(prevPointComponent);
    remove(prevAddEditComponent);

  };

  destroy = () => {
    remove(this.#pointComponent);
    remove(this.#addEditComponent);
  };

  resetView = () => {
    if (this.#mode !== Mode.DEFAULT) {
      this.#addEditComponent.reset(this.#point);
      this.#replaceFormToCard();
    }
  };

  setSaving = () => {
    this.#addEditComponent.updateElement({
      isDisabled: true,
      isSaving: true,
    });
  };

  setDeleting = () => {
    this.#addEditComponent.updateElement({
      isDisabled: true,
      isDeleting: true,
    });
  };

  setAborting = () => {
    if (this.#mode === Mode.DEFAULT) {
      this.#pointComponent.shake();
      return;
    }

    const resetFormState = () => {
      this.#addEditComponent.updateElement({
        isDisabled: false,
        isSaving: false,
        isDeleting: false,
      });
    };

    this.#addEditComponent.shake(resetFormState);
  };

  #replaceCardToForm = () => {
    replace(this.#addEditComponent, this.#pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
    this.#changeMode();
    this.#mode = Mode.EDITING;
  };

  #replaceFormToCard = () => {
    replace(this.#pointComponent, this.#addEditComponent);
    document.removeEventListener('keydown', this.#escKeyDownHandler);
    this.#mode = Mode.DEFAULT;
  };

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      this.#addEditComponent.reset(this.#point);
      this.#replaceFormToCard();
    }
  };

  #handleEditClick = () => {
    this.#replaceCardToForm();
  };

  #handleFormSubmit = (update) => {
    const isMinorUpdate = !isDateEqual(this.#point, update) || this.#point.basePrice !== update.basePrice;

    this.#changeData(
      UserAction.UPDATE_POINT,
      isMinorUpdate ? UpdateType.MINOR : UpdateType.PATCH,
      update
    );
  };

  #handleFavoriteClick = () => {
    this.#changeData(
      UserAction.UPDATE_POINT,
      UpdateType.MINOR,
      {...this.#point, isFavorite: !this.#point.isFavorite}
    );
  };

  #handleDeleteClick = (point) => {
    this.#changeData(
      UserAction.DELETE_POINT,
      UpdateType.MINOR,
      point
    );
  };

}

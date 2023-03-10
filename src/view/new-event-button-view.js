import AbstractView from '../framework/view/abstract-view.js';

const createNewEventButton = () => '<button class="trip-main__event-add-btn  btn  btn--big  btn--yellow" type="button">New event</button>';

export default class NewEventButtonView extends AbstractView{

  get template(){
    return createNewEventButton;
  }

  setClickHandler = (callback) => {
    this._callback.click = callback;
    this.element.addEventListener('click', this.#clickHandler);
  };

  setActiveButton = () => {this.element.disabled = false;};

  #clickHandler = (evt) => {
    evt.preventDefault();
    this.element.disabled = true;
    this._callback.click(this.setActiveButton);
  };

}

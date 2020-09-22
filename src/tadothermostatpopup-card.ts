import { LitElement, html, css, customElement, property, CSSResult, TemplateResult } from 'lit-element';
import { HomeAssistant, LovelaceCardEditor, getLovelace, LovelaceCardConfig } from 'custom-card-helpers';
import { closePopUp } from 'card-tools/src/popup';
import { provideHass } from 'card-tools/src/hass';
import { createCard } from 'card-tools/src/lovelace-element.js';
import { computeStateDisplay } from 'custom-card-helpers';
import { localize } from './localize/localize';
import { POPUP_CARD_VERSION } from './const';

/* eslint no-console: 0 */
console.info(
  `%c  TADOTHERMOSTAT-POPUP \n%c  ${localize('common.version')} ${POPUP_CARD_VERSION}    `,
  'color: orange; font-weight: bold; background: black',
  'color: white; font-weight: bold; background: dimgray',
);

(window as any).customCards = (window as any).customCards || [];
(window as any).customCards.push({
  type: 'tadothermostatpopup-card',
  name: 'Tadothermostat Popup',
  description: 'A popup card to work with the tado card',
});

// customElements.define('tadothermostatpopup-card', TadothermostatPopupCard);
@customElement('tadothermostatpopup-card')
export class TadothermostatPopupCard extends LitElement {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    return document.createElement('tadothermostatpopup-card-editor') as LovelaceCardEditor;
  }

  public static getStubConfig(): object {
    return {};
  }

  // Add any properities that should cause your element to re-render here
  @property() public hass!: HomeAssistant;
  @property() private config!: LovelaceCardConfig;

  public setConfig(config: LovelaceCardConfig): void {
    if (!config.entity) {
      throw new Error('You need to define a single entity');
    }

    if (!config || config.show_error) {
      throw new Error(localize('common.invalid_configuration'));
    }

    if (config.test_gui) {
      getLovelace().setEditMode(true);
    }

    if (!config.entity) {
      throw new Error('You need to define a climate entity');
    }
    this.config = {
      name: 'Tado Popup Card',
      ...config,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shadowRoot: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actionRows: any = [];
  settings = false;
  settingsCustomCard = false;
  settingsPosition = 'bottom';

  protected shouldUpdate(): boolean {
    return true;
  }

  protected render(): TemplateResult | void {
    const entity = this.config.entity;
    const stateObj = this.hass.states[entity];
    const actionsInARow = this.config.actionsInARow ? this.config.actionsInARow : 4;
    const icon = this.config.icon
      ? this.config.icon
      : stateObj.attributes.icon
      ? stateObj.attributes.icon
      : 'mdi:thermostat';
    const borderRadius = this.config.borderRadius ? this.config.borderRadius : '12px';
    // const supporttemperature = 1;
    const onStates = this.config.onStates ? this.config.onStates : ['on'];
    const offStates = this.config.offStates ? this.config.offStates : ['off'];
    //Scenes
    const actionSize = 'actionSize' in this.config ? this.config.actionSize : '50px';
    const actions = this.config.actions;
    if (actions && actions.length > 0) {
      const numberOfRows = Math.ceil(actions.length / actionsInARow);
      for (let i = 0; i < numberOfRows; i++) {
        this.actionRows[i] = [];
        for (let j = 0; j < actionsInARow; j++) {
          if (actions[i * actionsInARow + j]) {
            this.actionRows[i][j] = actions[i * actionsInARow + j];
          }
        }
      }
    }

    let switchValue = 0;

    if (onStates.includes(stateObj.state)) {
      switchValue = 1;
    }

    const fullscreen = 'fullscreen' in this.config ? this.config.fullscreen : true;
    const temperatureWidth = this.config.temperatureWidth ? this.config.temperatureWidth : '300px';
    const temperatureHeight = this.config.temperatureHeight ? this.config.temperatureHeight : '22px';
    const switchWidth = this.config.switchWidth ? this.config.switchWidth : '300px';
    const switchHeight = this.config.switchHeight ? this.config.switchHeight : '400px';

    const color = this._getColorForTempEntity(stateObj);
    // const sliderColor = 'sliderColor' in this.config ? this.config.sliderColor : '#FFF';
    // const sliderColoredByLight = 'sliderColoredByLight' in this.config ? this.config.sliderColoredByLight : false;
    // const sliderThumbColor = 'sliderThumbColor' in this.config ? this.config.sliderThumbColor : '#ddd';
    // const sliderTrackColor = 'sliderTrackColor' in this.config ? this.config.sliderTrackColor : '#ddd';
    let actionRowCount = 0;
    // const displayType = 'displayType' in this.config ? this.config.displayType : 'auto';

    this.settings = 'settings' in this.config ? true : false;
    this.settingsCustomCard = 'settingsCard' in this.config ? true : false;
    this.settingsPosition = 'settingsPosition' in this.config ? this.config.settingsPosition : 'bottom';
    if (this.settingsCustomCard && this.config.settingsCard.cardOptions) {
      if (this.config.settingsCard.cardOptions.entity && this.config.settingsCard.cardOptions.entity == 'this') {
        this.config.settingsCard.cardOptions.entity = entity;
      } else if (
        this.config.settingsCard.cardOptions.entity_id &&
        this.config.settingsCard.cardOptions.entity_id == 'this'
      ) {
        this.config.settingsCard.cardOptions.entity_id = entity;
      } else if (this.config.settingsCard.cardOptions.entities) {
        for (const key in this.config.settingsCard.cardOptions.entities) {
          if (this.config.settingsCard.cardOptions.entities[key] == 'this') {
            this.config.settingsCard.cardOptions.entities[key] = entity;
          }
        }
      }
    }
    const temperature = stateObj.attributes.temperature ? Math.round(stateObj.attributes.temperature / 1) : 0;
    return html`
      <div class="${fullscreen === true ? 'popup-wrapper' : ''}">
        <div id="popup" class="popup-inner" @click="${e => this._close(e)}">
          <div class="icon${fullscreen === true ? ' fullscreen' : ''}">
            <!-- <ha-icon style="${onStates.includes(stateObj.state)
              ? 'color:' + color + ';'
              : ''}" icon="${icon}" /> -->
          </div>
          <h4 id="temperatureValue">
            ${offStates.includes(stateObj.state)
              ? this.hass.localize(`component.climate.state._.off`)
              : temperature + 'C'}
          </h4>
          <div
            class="range-holder"
            style="--slider-height: ${temperatureHeight};--slider-width: ${temperatureWidth};"
          ></div>
          <h4>${computeStateDisplay(this.hass.localize, stateObj, this.hass.language)}</h4>
          <div class="switch-holder" style="--switch-height: ${switchHeight};--switch-width: ${switchWidth};">
            <input
              type="range"
              style="--switch-width: ${switchWidth};--switch-height: ${switchHeight}; --slider-border-radius: ${borderRadius}"
              value="0"
              min="0"
              max="1"
              .value="${switchValue.toString()}"
              @change=${() => this._switch(stateObj)}
            />
          </div>
          }
          ${actions && actions.length > 0
            ? html`
                <div class="action-holder">
                  ${this.actionRows.map(actionRow => {
                    actionRowCount++;
                    let actionCount = 0;
                    return html`
                      <div class="action-row">
                        ${actionRow.map(action => {
                          actionCount++;
                          return html`
                            <div
                              class="action"
                              style="--size:${actionSize};"
                              @click="${e => this._activateAction(e)}"
                              data-service="${actionRowCount}#${actionCount}"
                            >
                              <span class="color"
                                >${action.icon
                                  ? html`
                                      <ha-icon icon="${action.icon}"></ha-icon>
                                    `
                                  : html``}</span
                              >
                              ${action.name
                                ? html`
                                    <span class="name">${action.name}</span>
                                  `
                                : html``}
                            </div>
                          `;
                        })}
                      </div>
                    `;
                  })}
                </div>
              `
            : html``}
          ${this.settings
            ? html`
                <button
                  class="settings-btn ${this.settingsPosition}${fullscreen === true ? ' fullscreen' : ''}"
                  @click="${() => this._openSettings()}"
                >
                  ${this.config.settings.openButton ? this.config.settings.openButton : 'Settings'}
                </button>
              `
            : html``}
        </div>

        ${this.settings
          ? html`
              <div id="settings" class="settings-inner" @click="${e => this._close(e)}">
                ${this.settingsCustomCard
                  ? html`
                      <div
                        class="custom-card"
                        data-card="${this.config.settingsCard.type}"
                        data-options="${JSON.stringify(this.config.settingsCard.cardOptions)}"
                        data-style="${this.config.settingsCard.cardStyle ? this.config.settingsCard.cardStyle : ''}"
                      ></div>
                    `
                  : html`
                      <p style="color:#F00;">Set settingsCustomCard to render a lovelace card here!</p>
                    `}
                <button
                  class="settings-btn ${this.settingsPosition}${fullscreen === true ? ' fullscreen' : ''}"
                  @click="${() => this._closeSettings()}"
                >
                  ${this.config.settings.closeButton ? this.config.settings.closeButton : 'Close'}
                </button>
              </div>
            `
          : html``}
      </div>
    `;
  }

  // updated() {}

  firstUpdated(): void {
    if (this.settings && !this.settingsCustomCard) {
      const mic = this.shadowRoot.querySelector('more-info-controls').shadowRoot;
      mic.removeChild(mic.querySelector('app-toolbar'));
    } else if (this.settings && this.settingsCustomCard) {
      this.shadowRoot.querySelectorAll('.custom-card').forEach(customCard => {
        let card = {
          type: customCard.dataset.card,
        };
        card = Object.assign({}, card, JSON.parse(customCard.dataset.options));
        const cardElement = createCard(card);
        customCard.appendChild(cardElement);
        provideHass(cardElement);
        let style = '';
        if (customCard.dataset.style) {
          style = customCard.dataset.style;
        }
        if (style != '') {
          let itterations = 0;
          const interval = setInterval(function() {
            if (cardElement && cardElement.shadowRoot) {
              window.clearInterval(interval);
              const styleElement = document.createElement('style');
              styleElement.innerHTML = style;
              cardElement.shadowRoot.appendChild(styleElement);
            } else if (++itterations === 10) {
              window.clearInterval(interval);
            }
          }, 100);
        }
      });
    }
  }

  _close(event): void {
    if (
      event &&
      (event.target.className.includes('popup-inner') || event.target.className.includes('settings-inner'))
    ) {
      closePopUp();
    }
  }

  _openSettings(): void {
    this.shadowRoot.getElementById('popup').classList.add('off');
    this.shadowRoot.getElementById('settings').classList.add('on');
  }
  _closeSettings(): void {
    this.shadowRoot.getElementById('settings').classList.remove('on');
    this.shadowRoot.getElementById('popup').classList.remove('off');
  }

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  _createRange(amount) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: any = [];
    for (let i = 0; i < amount; i++) {
      items.push(i);
    }
    return items;
  }

  _previewTemperature(value): void {
    const el = this.shadowRoot.getElementById('temperatureValue');
    if (el) {
      el.innerText = value == 0 ? 'Off' : value + '%';
    }
  }

  _setTemperature(state, value): void {
    this.hass.callService('homeassistant', 'set_temperature', {
      entity_id: state.entity_id,
      temperature: value,
      hvac_mode: 'heat',
    });
  }

  _switch(state) {
    this.hass.callService('homeassistant', 'set_hvac_mode', {
      entity_id: state.entity_id,
      hvac_mode: 'heat',
    });
  }

  _activateAction(e) {
    if (e.target.dataset && e.target.dataset.service) {
      const [row, item] = e.target.dataset.service.split('#', 2);
      const action = this.actionRows[row - 1][item - 1];
      const [domain, service] = action.service.split('.', 2);
      this.hass.callService(domain, service, action.service_data);
    }
  }

  _getColorForTempEntity(stateObj): TemplateResult {
    let color = this.config.default_color ? this.config.default_color : undefined;
    const setpointcolors = [
      [
        [60, 150, 114, 0.8],
        [60, 150, 114, 0.5],
        [60, 134, 139],
      ],
      [
        [60, 153, 115, 0.8],
        [60, 153, 115, 0.5],
        [57, 139, 142],
      ],
      [
        [60, 158, 116, 0.8],
        [60, 158, 116, 0.5],
        [54, 144, 143],
      ],
      [
        [61, 162, 117, 0.8],
        [61, 162, 117, 0.5],
        [51, 147, 142],
      ],
      [
        [61, 166, 117, 0.8],
        [61, 166, 117, 0.5],
        [48, 149, 140],
      ],
      [
        [61, 170, 118, 0.8],
        [61, 170, 118, 0.5],
        [45, 152, 138],
      ],
      [
        [62, 174, 118, 0.8],
        [62, 174, 118, 0.5],
        [42, 154, 135],
      ],
      [
        [62, 178, 119, 0.8],
        [62, 178, 119, 0.5],
        [40, 157, 132],
      ],
      [
        [62, 182, 119, 0.8],
        [62, 182, 119, 0.5],
        [37, 159, 129],
      ],
      [
        [62, 187, 119, 0.8],
        [62, 187, 119, 0.5],
        [34, 162, 125],
      ],
      [
        [62, 191, 119, 0.8],
        [62, 191, 119, 0.5],
        [31, 164, 120],
      ],
      [
        [63, 194, 119, 0.8],
        [63, 194, 119, 0.5],
        [28, 166, 116],
      ],
      [
        [66, 196, 120, 0.8],
        [66, 196, 120, 0.5],
        [26, 169, 110],
      ],
      [
        [68, 198, 120, 0.8],
        [68, 198, 120, 0.5],
        [23, 171, 105],
      ],
      [
        [255, 208, 0, 0.8],
        [255, 208, 0, 0.5],
        [255, 187, 0],
      ],
      [
        [255, 197, 0, 0.8],
        [255, 197, 0, 0.5],
        [255, 170, 0],
      ],
      [
        [255, 186, 0, 0.8],
        [255, 186, 0, 0.5],
        [255, 153, 0],
      ],
      [
        [255, 174, 0, 0.8],
        [255, 174, 0, 0.5],
        [255, 136, 0],
      ],
      [
        [255, 163, 0, 0.8],
        [255, 163, 0, 0.5],
        [255, 119, 0],
      ],
      [
        [255, 152, 0, 0.8],
        [255, 152, 0, 0.5],
        [255, 102, 0],
      ],
      [
        [255, 140, 0, 0.8],
        [255, 140, 0, 0.5],
        [255, 85, 0],
      ],
    ]; // remove 5 from array to get color
    if (stateObj) {
      if (stateObj.attributes.temperature) {
        const color_fromarray = setpointcolors[stateObj.attributes.temperature - 5];
        color = `radial-gradient(circle farthest-side at left top, rgba(${color_fromarray[0][0]}, ${color_fromarray[0][1]}, ${color_fromarray[0][2]}, ${color_fromarray[0][3]}), rgba(${color_fromarray[1][0]}, ${color_fromarray[1][1]}, ${color_fromarray[1][2]}, ${color_fromarray[1][3]})), rgb(${color_fromarray[2][0]}, ${color_fromarray[2][1]}, ${color_fromarray[2][2]})`;
      } else {
        color = `linear-gradient(rgb(159, 179, 194), rgb(104, 131, 150))`;
      }
    }
    return color;
  }

  // _applytemperatureToColor(color, temperature) {
  //   const colorObj = new TinyColor(this._getColorFromVariable(color));
  //   if (colorObj.isValid) {
  //     const validColor = colorObj.mix('black', 100 - temperature).toString();
  //     if (validColor) return validColor;
  //   }
  //   return color;
  // }

  // _getLightColorBasedOnTemperature(current, min, max) {
  //   const high = new TinyColor('rgb(255, 160, 0)'); // orange-ish
  //   const low = new TinyColor('rgb(166, 209, 255)'); // blue-ish
  //   const middle = new TinyColor('white');
  //   const mixAmount = ((current - min) / (max - min)) * 100;
  //   if (mixAmount < 50) {
  //     return tinycolor(low)
  //       .mix(middle, mixAmount * 2)
  //       .toRgbString();
  //   } else {
  //     return tinycolor(middle)
  //       .mix(high, (mixAmount - 50) * 2)
  //       .toRgbString();
  //   }
  // }

  // _getDefaultColorForState() {
  //   return this.config.color_on ? this.config.color_on : '#f7d959';
  // }

  // _getColorFromVariable(color: string): string {
  //   if (typeof color !== 'undefined' && color.substring(0, 3) === 'var') {
  //     return window
  //       .getComputedStyle(document.documentElement)
  //       .getPropertyValue(color.substring(4).slice(0, -1))
  //       .trim();
  //   }
  //   return color;
  // }

  // getCardSize(): number {
  //   return this.config.entities.length + 1;
  // }

  static get styles(): CSSResult {
    return css`
      :host {
        background-color: #000 !important;
      }
      .popup-wrapper {
        margin-top: 64px;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      }
      .popup-inner {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      .popup-inner.off {
        display: none;
      }
      #settings {
        display: none;
      }
      .settings-inner {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      #settings.on {
        display: flex;
      }
      .settings-btn {
        position: absolute;
        right: 30px;
        background-color: #7f8082;
        color: #fff;
        border: 0;
        padding: 5px 20px;
        border-radius: 10px;
        font-weight: 500;
        cursor: pointer;
      }
      .settings-btn.bottom {
        bottom: 15px;
      }
      .settings-btn.bottom.fullscreen {
        margin: 0;
      }
      .settings-btn.top {
        top: 25px;
      }
      .fullscreen {
        margin-top: -64px;
      }
      .icon {
        text-align: center;
        display: block;
        height: 40px;
        width: 40px;
        color: rgba(255, 255, 255, 0.3);
        font-size: 30px;
        --mdc-icon-size: 30px;
        padding-top: 5px;
      }
      .icon ha-icon {
        width: 30px;
        height: 30px;
      }
      .icon.on ha-icon {
        color: #f7d959;
      }
      h4 {
        color: #fff;
        display: block;
        font-weight: 300;
        margin-bottom: 30px;
        text-align: center;
        font-size: 20px;
        margin-top: 0;
        text-transform: capitalize;
      }

      .range-holder {
        height: var(--slider-height);
        width: var(--slider-width);
        position: relative;
        display: block;
      }
      .range-holder input[type='range'] {
        outline: 0;
        border: 0;
        border-radius: var(--slider-border-radius, 12px);
        width: var(--slider-height);
        margin: 0;
        transition: box-shadow 0.2s ease-in-out;
        -webkit-transform: rotate(270deg);
        -moz-transform: rotate(270deg);
        -o-transform: rotate(270deg);
        -ms-transform: rotate(270deg);
        transform: rotate(270deg);
        overflow: hidden;
        height: var(--slider-width);
        -webkit-appearance: none;
        background-color: var(--slider-track-color);
        position: absolute;
        top: calc(50% - (var(--slider-width) / 2));
        right: calc(50% - (var(--slider-height) / 2));
      }
      .range-holder input[type='range']::-webkit-slider-runnable-track {
        height: var(--slider-width);
        -webkit-appearance: none;
        background-color: var(--slider-track-color);
        margin-top: -1px;
        transition: box-shadow 0.2s ease-in-out;
      }
      .range-holder input[type='range']::-webkit-slider-thumb {
        width: 25px;
        border-right: 10px solid var(--slider-color);
        border-left: 10px solid var(--slider-color);
        border-top: 20px solid var(--slider-color);
        border-bottom: 20px solid var(--slider-color);
        -webkit-appearance: none;
        height: 80px;
        cursor: ew-resize;
        background: #fff;
        box-shadow: -350px 0 0 350px var(--slider-color), inset 0 0 0 80px var(--slider-thumb-color);
        border-radius: 0;
        transition: box-shadow 0.2s ease-in-out;
        position: relative;
        top: calc((var(--slider-width) - 80px) / 2);
      }
      .range-holder input[type='range']::-moz-thumb-track {
        height: var(--slider-width);
        background-color: var(--slider-track-color);
        margin-top: -1px;
        transition: box-shadow 0.2s ease-in-out;
      }
      .range-holder input[type='range']::-moz-range-thumb {
        width: 5px;
        border-right: 12px solid var(--slider-color);
        border-left: 12px solid var(--slider-color);
        border-top: 20px solid var(--slider-color);
        border-bottom: 20px solid var(--slider-color);
        height: calc(var(--slider-width) * 0.4);
        cursor: ew-resize;
        background: #fff;
        box-shadow: -350px 0 0 350px var(--slider-color), inset 0 0 0 80px var(--slider-thumb-color);
        border-radius: 0;
        transition: box-shadow 0.2s ease-in-out;
        position: relative;
        top: calc((var(--slider-width) - 80px) / 2);
      }
      .switch-holder {
        height: var(--switch-height);
        width: var(--switch-width);
        position: relative;
        display: block;
      }
      .switch-holder input[type='range'] {
        outline: 0;
        border: 0;
        border-radius: var(--slider-border-radius, 12px);
        width: calc(var(--switch-height) - 20px);
        margin: 0;
        transition: box-shadow 0.2s ease-in-out;
        -webkit-transform: rotate(270deg);
        -moz-transform: rotate(270deg);
        -o-transform: rotate(270deg);
        -ms-transform: rotate(270deg);
        transform: rotate(270deg);
        overflow: hidden;
        height: calc(var(--switch-width) - 20px);
        -webkit-appearance: none;
        background-color: #ddd;
        padding: 10px;
        position: absolute;
        top: calc(50% - (var(--switch-width) / 2));
        right: calc(50% - (var(--switch-height) / 2));
      }
      .switch-holder input[type='range']::-webkit-slider-runnable-track {
        height: calc(var(--switch-width) - 20px);
        -webkit-appearance: none;
        color: #ddd;
        margin-top: -1px;
        transition: box-shadow 0.2s ease-in-out;
      }
      .switch-holder input[type='range']::-webkit-slider-thumb {
        width: calc(var(--switch-height) / 2);
        -webkit-appearance: none;
        height: calc(var(--switch-width) - 20px);
        cursor: ew-resize;
        background: #fff;
        transition: box-shadow 0.2s ease-in-out;
        border: none;
        box-shadow: -1px 1px 20px 0px rgba(0, 0, 0, 0.75);
        position: relative;
        top: 0;
        border-radius: var(--slider-border-radius, 12px);
      }

      .action-holder {
        display: flex;
        flex-direction: column;
        margin-top: 20px;
      }
      .action-row {
        display: block;
        padding-bottom: 10px;
      }
      .action-row:last-child {
        padding: 0;
      }
      .action-holder .action {
        display: inline-block;
        margin-right: 4px;
        margin-left: 4px;
        cursor: pointer;
      }
      .action-holder .action:nth-child(4n) {
        margin-right: 0;
      }
      .action-holder .action .color {
        width: var(--size);
        height: var(--size);
        border-radius: 50%;
        display: block;
        border: 1px solid #fff;
        line-height: var(--size);
        text-align: center;
        pointer-events: none;
      }
      .action-holder .action .color ha-icon {
        pointer-events: none;
      }
      .action-holder .action .name {
        width: var(--size);
        display: block;
        color: #fff;
        font-size: 9px;
        margin-top: 3px;
        text-align: center;
        pointer-events: none;
      }
    `;
  }
}

// customElements.define('tadothermostatpopup-card', TadothermostatPopupCard);

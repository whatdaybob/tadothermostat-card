import { LitElement, html, css, svg, CSSResult, TemplateResult, SVGTemplateResult } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { closePopUp } from 'card-tools/src/popup';

// import stylesFromSCSS from './styles/popup_styles.module.scss';

// import stylesFromCSS from './styles/popup_styles.module.css';
// import { computeRTLDirection } from 'custom-card-helpers';
// import { computeStateDisplay, computeStateName } from 'custom-card-helpers';

class TadoPopupCard extends LitElement {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  hass: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  shadowRoot: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _setTemp: any;
  tempselection: boolean;
  dragging: any;

  hvacModeOrdering = {
    // 0: "off",
    // 1: "auto",
    // 2: "heat"
    auto: 1,
    heat: 2,
    off: 3,
    // heat_cool: 2,
    // cool: 4,
    // dry: 5,
    // fan_only: 6,
  };
  modeIcons = {
    auto: 'hass:calendar-repeat',
    // auto: 'mdi:repeat',
    // heat_cool: 'hass:autorenew',
    heat: 'hass:fire',
    // cool: 'hass:snowflake',
    off: 'hass:power',
    // fan_only: 'hass:fan',
    // dry: 'hass:water-percent',
  };
  settings = false;
  settingsCustomCard = false;
  settingsPosition = 'bottom';

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  static get properties() {
    return {
      hass: {},
      config: {},
      active: {},
      tempselection: { type: Boolean },
      dragging: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this.tempselection = false;
    this.dragging = false;
  }

  protected render(): TemplateResult | void {
    const entity = this.config.entity;
    const stateObj = this.hass.states[entity];
    // console.log(stateObj);
    // const icon = this.config.icon
    //   ? this.config.icon
    //   : stateObj.attributes.icon
    //   ? stateObj.attributes.icon
    //   : 'mdi:lightbulb';

    // REAL DATA
    const name = this.config.name || stateObj.attributes.friendly_name;
    const targetTemp =
      stateObj.attributes.temperature !== null && stateObj.attributes.temperature
        ? stateObj.attributes.temperature
        : stateObj.attributes.min_temp;
    // const max_temp = stateObj.attributes.max_temp;
    // const min_temp = stateObj.attributes.min_temp;
    // const preset_mode = stateObj.attributes.preset_mode;
    // const preset_modes = stateObj.attributes.preset_modes;
    const currentTemp = stateObj.attributes.current_temperature;
    const currentHum = parseInt(stateObj.attributes.current_humidity);
    // const hvac_action = stateObj.attributes.hvac_action;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mode: any = '';
    mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
    let thermostat__body: string;
    let thermostat__header: string;

    if (stateObj.attributes.hvac_action == 'off') {
      mode = 'off';
      thermostat__header = 'Frost Protection';
      thermostat__body = 'OFF';
    } else if (stateObj.attributes.hvac_action == 'heating') {
      mode = 'heat';
      thermostat__header = 'Set to';
      thermostat__body = targetTemp.toString() + '°';
    } else if (stateObj.attributes.hvac_action == 'idle') {
      mode = 'idle';
      thermostat__header = 'Set to';
      thermostat__body = targetTemp.toString() + '°';
    } else {
      mode = stateObj.state in this.modeIcons ? stateObj.state : 'unknown-mode';
      thermostat__header = 'No remote access';
      thermostat__body = 'replace with svg';
    }
    let thermostat__class: string;
    if (stateObj.state in this.modeIcons) {
      if (stateObj.attributes.hvac_action == 'off') {
        thermostat__class = 'temp-off';
      } else {
        thermostat__class = 'temp-' + parseInt(targetTemp).toString();
      }
    } else {
      thermostat__class = 'disconnected';
    }

    const _handleSize = 15;
    const _stepSize = this.config.stepSize
      ? this.config.stepSize
      : stateObj.attributes.target_temp_step
      ? stateObj.attributes.target_temp_step
      : 1;
    const gradient = true;
    const gradientPoints = [
      { point: 0, color: '#4fdae4' },
      { point: 10, color: '#2da9d8' },
      { point: 25, color: '#56b557' },
      { point: 50, color: '#f4c807' },
      { point: 70, color: '#faaa00' },
      { point: 100, color: '#f86618' },
    ];
    const fullscreen = 'fullscreen' in this.config ? this.config.fullscreen : true;
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

    // let clicked = false;

    // $(document).on('mousedown', '.fa-arrows', function() {
    //   $(this)
    //     .removeClass('fa-arrows')
    //     .addClass('fa-random');
    //   clicked = true;
    // });

    // $(document).on('mouseup', function() {
    //   if (clicked) {
    //     clicked = false;
    //     $('.fa-random')
    //       .removeClass('fa-random')
    //       .addClass('fa-arrows');
    //   }
    // });

    // console.log(this.active);
    return html`
      <div class="${fullscreen === true ? 'popup-wrapper' : ''}">
        <div class="${classMap({ [mode]: true })}" style="display:flex;width:100%;height:100%;">
          <div id="popup" class="popup-inner ${thermostat__class}" @click="${e => this._close(e)}">
            ${this.tempselection
              ? html`
                  <div class="tado-card--slider">
                    <div class="temperature-slider--header " style="">
                      <div class="temperature-slider--toolbar">
                        <div @click="${() => this._thermostat_mouseclick()}">
                          <svg class="panel-btn" tabindex="2" id="back-button" viewBox="0 0 28 28">
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M0 14C0 21.732 6.26801 28 14 28C21.732 28 28 21.732 28 14C28 6.26801 21.732 0 14 0C6.26801 0 0 6.26801 0 14ZM26.7272 14C26.7272 21.0291 21.029 26.7273 14 26.7273C6.97089 26.7273 1.27269 21.0291 1.27269 14C1.27269 6.97091 6.97089 1.27272 14 1.27272C21.029 1.27272 26.7272 6.97091 26.7272 14Z"
                              fill="#007AFF"
                            ></path>
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M14 0C6.26734 0 0 6.26734 0 14C0 21.7315 6.26734 28 14 28C21.7315 28 28 21.7315 28 14C28 6.26734 21.7315 0 14 0Z"
                            ></path>
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M11.9318 14.1273C11.806 13.9964 11.8079 13.7891 11.9362 13.6606L17.0778 8.50739C17.4034 8.18102 17.4023 7.653 17.0753 7.32802L16.9897 7.24301C16.6627 6.91802 16.1337 6.91914 15.808 7.24551L9.43074 13.6372C9.30248 13.7657 9.30054 13.973 9.42636 14.1039L15.8075 20.7433C16.1269 21.0757 16.6559 21.0867 16.989 20.7679L17.0761 20.6845C17.4091 20.3657 17.4201 19.8378 17.1007 19.5054L11.9318 14.1273Z"
                              fill="white"
                            ></path>
                          </svg>
                        </div>
                        <svg class="panel-btn " tabindex="2" id="confirm-button" viewBox="0 0 28 28">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M14 0C6.26734 0 0 6.26734 0 14C0 21.7315 6.26734 28 14 28C21.7315 28 28 21.7315 28 14C28 6.26734 21.7315 0 14 0Z"
                          ></path>
                          <path
                            d="M12.2465 18.0302L19.8067 8.95796C20.0929 8.61449 20.6033 8.56809 20.9468 8.85431C21.2902 9.14052 21.3367 9.65098 21.0504 9.99444L12.9552 19.7087C12.6625 20.0599 12.1372 20.0992 11.7955 19.7955L6.93839 15.4781C6.60423 15.181 6.57413 14.6693 6.87116 14.3352C7.16819 14.001 7.67986 13.9709 8.01402 14.268L12.2465 18.0302Z"
                            fill="white"
                          ></path>
                        </svg>
                      </div>
                      <div class="value-label">
                        <div class="app-temperature-display"></div>
                        <div class="">
                          <div class="b-temperature">18°</div>
                        </div>
                      </div>
                    </div>
                    <div class="room-thermostat-area--slider" tabindex="0">
                      <div class="app-temperature-slider" style="width: 300px; height: 400px; opacity: 1;">
                        <div id="track" class="track" style="height: 0%;"></div>
                        <input
                          type="range"
                          min="4"
                          max="25"
                          step="1"
                          style="width: 444px; height: 300px; transform-origin: 222px 222px;"
                          @change="${e => this._change_track(e)}"
                          @input="${e => this._change_track(e)}"
                        />
                      </div>
                    </div>
                  </div>
                  <!-- </div> -->
                `
              : html`
                  <!-- Tado Thermostat START -->
                  <div
                    class="tado-card"
                    @mousedown="${() => this._thermostat_mousedown()}"
                    @mouseup="${() => this._thermostat_mouseup()}"
                    @click="${() => this._thermostat_mouseclick()}"
                  >
                    <div id="thermostat" class="room-thermostat-area" tabindex="0">
                      <div class="thermostat">
                        <div role="button" class="thermostat__header_and_body ">
                          <div class="thermostat__header ">
                            <span>${thermostat__header}</span>
                          </div>
                          <div class="thermostat__body">
                            <span class="b-temperature  " style="text-transform: uppercase">${thermostat__body}</span>
                            <div class="app-heat-request-indicator">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                width="24"
                                height="24"
                              >
                                <path
                                  d="M1.87697 2.77194C1.39922 2.16421 1.50209 1.28228 2.10674 0.802095C2.71138 0.321909 3.58884 0.425306 4.06658 1.03304C6.82192 4.53804 6.82192 8.44325 4.12153 12.3907C2.12537 15.3087 2.36258 18.1189 4.92785 21.197C5.42268 21.7907 5.34493 22.6753 4.75418 23.1726C4.16344 23.67 3.2834 23.5918 2.78857 22.9981C-0.555716 18.9852 -0.909462 14.7944 1.82202 10.8015C3.84928 7.83808 3.84928 5.28087 1.87697 2.77194Z"
                                ></path>
                                <path
                                  d="M10.8069 2.77194C10.3292 2.16421 10.432 1.28228 11.0367 0.802095C11.6413 0.321909 12.5188 0.425306 12.9965 1.03304C15.7519 4.53804 15.7519 8.44325 13.0515 12.3907C11.0553 15.3087 11.2925 18.1189 13.8578 21.197C14.3526 21.7907 14.2749 22.6753 13.6841 23.1726C13.0934 23.67 12.2133 23.5918 11.7185 22.9981C8.37422 18.9852 8.02047 14.7944 10.752 10.8015C12.7792 7.83808 12.7792 5.28087 10.8069 2.77194Z"
                                ></path>
                                <path
                                  d="M19.7371 2.77194C19.2593 2.16421 19.3622 1.28228 19.9668 0.802095C20.5715 0.321909 21.4489 0.425306 21.9267 1.03304C24.682 4.53804 24.682 8.44325 21.9816 12.3907C19.9855 15.3087 20.2227 18.1189 22.788 21.197C23.2828 21.7907 23.205 22.6753 22.6143 23.1726C22.0235 23.67 21.1435 23.5918 20.6487 22.9981C17.3044 18.9852 16.9506 14.7944 19.6821 10.8015C21.7094 7.83808 21.7094 5.28087 19.7371 2.77194Z"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div
                          class="thermostat__footer  ng-trigger ng-trigger-closeFooter"
                          style="max-height: 0%; opacity: 0"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <!-- Tado Thermostat END -->
                  <!-- Tado Sensors START -->
                  <div class="info">
                    <div class="sensors-container">
                      <div class="sensor">
                        <div class="temperature sensor__label">Inside now</div>
                        <div class="temperature sensor__value">
                          <div class="b-temperature">${currentTemp}&#176;</div>
                        </div>
                      </div>
                      <div class="sensor">
                        <div class="sensor__label">Humidity</div>
                        <div class="sensor__value">
                          <div class="b-humidity">${currentHum}%</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- Tado Sensors END -->
                `}

            <!-- <div id="controls">
              <div id="slider">
                <custom-round-slider
                  .value=${targetTemp}
                  .low=${stateObj.attributes.target_temp_low}
                  .high=${stateObj.attributes.target_temp_high}
                  .min=${stateObj.attributes.min_temp}
                  .max=${stateObj.attributes.max_temp}
                  .step=${_stepSize}
                  .handleSize=${_handleSize}
                  .gradient=${gradient}
                  .gradientPoints=${gradientPoints}
                  @value-changing=${this._dragEvent}
                  @value-changed=${this._setTemperature}
                ></custom-round-slider>

                <div id="slider-center">
                  <div class="values">
                    <div class="action">
                      ${stateObj.attributes.hvac_action
              ? this.hass!.localize(`state_attributes.climate.hvac_action.${stateObj.attributes.hvac_action}`)
              : this.hass!.localize(`state.climate.${stateObj.state}`)}
                      ${stateObj.attributes.preset_mode && stateObj.attributes.preset_mode !== 'none'
              ? html`
                  -
                  ${this.hass!.localize(`state_attributes.climate.preset_mode.${stateObj.attributes.preset_mode}`) ||
                    stateObj.attributes.preset_mode}
                `
              : ''}
                    </div>
                    <div class="value">
                      ${!this._setTemp
              ? ''
              : Array.isArray(this._setTemp)
              ? _stepSize === 1
                ? svg`
                                ${this._setTemp[0].toFixed()}&#176; -
                                ${this._setTemp[1].toFixed()}&#176;
                                `
                : svg`
                                ${this._setTemp[0].toFixed(1)}&#176; -
                                ${this._setTemp[1].toFixed(1)}&#176;
                                `
              : _stepSize === 1
              ? svg`
                                ${this._setTemp.toFixed()}&#176;
                                `
              : svg`
                                ${this._setTemp.toFixed(1)}&#176;
                                `}
                    </div>
                  </div>
                </div>
              </div>
            </div> -->
            <!-- <div id="modes">
              ${(stateObj.attributes.hvac_modes || [])
              .concat()
              .sort(this._compareClimateHvacModes)
              .map(modeItem => this._renderIcon(modeItem, mode))}
            </div> -->

            <!-- <div class="temp ${mode}">
              ${currentTemp}&#176;
            </div> -->
            <!-- <div class="right">
              <div class="name">${name}</div>
              <div class="action">
                ${stateObj.attributes.hvac_action
              ? this.hass!.localize(`state_attributes.climate.hvac_action.${stateObj.attributes.hvac_action}`)
              : this.hass!.localize(`state.climate.${stateObj.state}`)}
                ${stateObj.attributes.preset_mode && stateObj.attributes.preset_mode !== 'none'
              ? html`
                  -
                  ${this.hass!.localize(`state_attributes.climate.preset_mode.${stateObj.attributes.preset_mode}`) ||
                    stateObj.attributes.preset_mode}
                `
              : ''}
                ${targetTemp}&#176;
              </div>
            </div> -->
            <div>
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
                          <card-maker
                            nohass
                            data-card="${this.config.settingsCard.type}"
                            data-options="${JSON.stringify(this.config.settingsCard.cardOptions)}"
                            data-style="${this.config.settingsCard.cardStyle ? this.config.settingsCard.cardStyle : ''}"
                          >
                          </card-maker>
                        `
                      : html`
                          <more-info-controls
                            .dialogElement=${null}
                            .canConfigure=${false}
                            .hass=${this.hass}
                            .stateObj=${stateObj}
                            style="--paper-slider-knob-color: white !important;
                  --paper-slider-knob-start-color: white !important;
                  --paper-slider-pin-color: white !important;
                  --paper-slider-active-color: white !important;
                  color: white !important;
                  --primary-text-color: white !important;"
                          ></more-info-controls>
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
        </div>
      </div>
    `;
  }

  private _thermostat_mouseclick(): void {
    if (this.tempselection) {
      this.tempselection = false;
    } else {
      this.tempselection = true;
    }
  }

  firstUpdated() {
    if (this.settings && !this.settingsCustomCard) {
      const mic = this.shadowRoot.querySelector('more-info-controls').shadowRoot;
      mic.removeChild(mic.querySelector('app-toolbar'));
    } else if (this.settings && this.settingsCustomCard) {
      this.shadowRoot.querySelectorAll('card-maker').forEach(customCard => {
        let card = {
          type: customCard.dataset.card,
        };
        card = Object.assign({}, card, JSON.parse(customCard.dataset.options));
        customCard.config = card;

        let style = '';
        if (customCard.dataset.style) {
          style = customCard.dataset.style;
        }

        if (style != '') {
          let itterations = 0;
          const interval = setInterval(function() {
            const el = customCard.children[0];
            if (el) {
              window.clearInterval(interval);

              const styleElement = document.createElement('style');
              styleElement.innerHTML = style;
              el.shadowRoot.appendChild(styleElement);
            } else if (++itterations === 10) {
              window.clearInterval(interval);
            }
          }, 100);
        }
      });
    }
  }

  updated() {
    this._setTemp = this._getSetTemp(this.hass!.states[this.config!.entity]);
  }

  _openSettings() {
    this.shadowRoot.getElementById('popup').classList.add('off');
    this.shadowRoot.getElementById('settings').classList.add('on');
  }
  _closeSettings() {
    this.shadowRoot.getElementById('settings').classList.remove('on');
    this.shadowRoot.getElementById('popup').classList.remove('off');
  }
  _thermostat_mousedown() {
    // console.log(this);
    this.shadowRoot.getElementById('thermostat').classList.add('mousedown');
  }
  _thermostat_mouseup() {
    // console.log(this);
    this.shadowRoot.getElementById('thermostat').classList.remove('mousedown');
  }

  _change_track(e) {
    // if (e.type == 'change') {
    // console.log(e.srcElement.value);
    // } else if (e.type == 'input') {
    // console.log(e);
    this.shadowRoot.getElementById('track').style.height = ((100 / 21) * (e.srcElement.value - 4)).toString() + '%';
    //   $('#div')[0].className =
    //   $('#div')[0].className.replace(/\bel.*?\b/g, '');
    // el_down.innerHTML =
    //   "Every class starting with 'el' is removed from the element.";

    if (e.srcElement.value - 4 > 0) {
      this.shadowRoot.getElementById('popup').className = this.shadowRoot
        .getElementById('popup')
        .className.replace(/temp.*/g, '');
      this.shadowRoot.getElementById('popup').classList.add('temp-' + e.srcElement.value.toString());
    } else {
      this.shadowRoot.getElementById('popup').classList.add('temp-off');
    }

    // } else {
    // console.log(e);
    // }
    // console.log(e);
  }

  _renderIcon(mode: string, currentMode: string) {
    if (!this.modeIcons[mode]) {
      return html``;
    }
    return html`
      <ha-icon-button
        class="${classMap({ 'selected-icon': currentMode === mode })}"
        .mode="${mode}"
        .icon="${this.modeIcons[mode]}"
        @click="${this._handleModeClick}"
        tabindex="0"
      ></ha-icon-button>
    `;
  }

  _handleModeClick(e: MouseEvent): void {
    this.hass!.callService('climate', 'set_hvac_mode', {
      entity_id: this.config!.entity,
      hvac_mode: (e.currentTarget as any).mode,
    });
  }

  _getSetTemp(stateObj) {
    if (stateObj.state === 'unavailable') {
      return this.hass!.localize('state.default.unavailable');
    }

    if (stateObj.attributes.target_temp_low && stateObj.attributes.target_temp_high) {
      return [stateObj.attributes.target_temp_low, stateObj.attributes.target_temp_high];
    }

    return stateObj.attributes.temperature;
  }

  _close(event) {
    if (
      event &&
      (event.target.className.includes('popup-inner') || event.target.className.includes('settings-inner'))
    ) {
      closePopUp();
    }
  }

  _dragEvent(e): void {
    const stateObj = this.hass!.states[this.config!.entity];

    if (e.detail.low) {
      this._setTemp = [e.detail.low, stateObj.attributes.target_temp_high];
    } else if (e.detail.high) {
      this._setTemp = [stateObj.attributes.target_temp_low, e.detail.high];
    } else {
      this._setTemp = e.detail.value;
    }
  }

  _setTemperature(e): void {
    const stateObj = this.hass!.states[this.config!.entity];

    if (e.detail.low) {
      this.hass!.callService('climate', 'set_temperature', {
        entity_id: this.config!.entity,
        target_temp_low: e.detail.low,
        target_temp_high: stateObj.attributes.target_temp_high,
      });
    } else if (e.detail.high) {
      this.hass!.callService('climate', 'set_temperature', {
        entity_id: this.config!.entity,
        target_temp_low: stateObj.attributes.target_temp_low,
        target_temp_high: e.detail.high,
      });
    } else {
      this.hass!.callService('climate', 'set_temperature', {
        entity_id: this.config!.entity,
        temperature: e.detail.value,
      });
    }
  }

  _compareClimateHvacModes = (mode1, mode2) => this.hvacModeOrdering[mode1] - this.hvacModeOrdering[mode2];

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define a climate entity');
    }
    if (!config.heating) {
      throw new Error('You need to define a heating entity');
    }

    this.config = config;
  }

  getCardSize() {
    return 1;
  }

  //   static get styles() {
  //     return [stylesFromSCSS];
  //   }

  static get styles() {
    return css`
      :host {
        --heat-color: #ee7600;
        --manual-color: #44739e;
        --off-color: lightgrey;
        --fan_only-color: #8a8a8a;
        --dry-color: #efbd07;
        --idle-color: #00cc66;
        --unknown-color: #bac;
      }
      :host *:focus {
        outline: -webkit-focus-ring-color auto 0px;
      }

      /* .popup-wrapper {
      margin-top: 64px;
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    } */
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
      .settings-btn.top {
        top: 25px;
      }
      .settings-btn.bottom.fullscreen {
        margin: 0;
      }
      .fullscreen {
        margin-top: -64px;
      }
      .info {
        display: flex;
        flex-direction: row;
        margin-bottom: 40px;
      }
      .info .temp {
        background-color: #67cd67;
        height: 60px;
        width: 60px;
        text-align: center;
        line-height: 60px;
        border-radius: 100%;
        color: #fff;
        font-size: 18px;
      }

      .info .temp.heat_cool {
        background-color: var(--auto-color);
      }
      .info .temp.cool {
        background-color: var(--cool-color);
      }
      .info .temp.heat {
        background-color: var(--heat-color);
      }
      .info .temp.manual {
        background-color: var(--manual-color);
      }
      .info .temp.off {
        background-color: var(--off-color);
      }
      .info .temp.fan_only {
        background-color: var(--fan_only-color);
      }
      .info .temp.eco {
        background-color: var(--eco-color);
      }
      .info .temp.dry {
        background-color: var(--dry-color);
      }
      .info .temp.idle {
        background-color: var(--idle-color);
      }
      .info .temp.unknown-mode {
        background-color: var(--unknown-color);
      }

      .info .right {
        display: flex;
        flex-direction: column;
        margin-left: 15px;
        height: 60px;
        align-items: center;
        justify-content: center;
      }
      .info .right .name {
        color: #fff;
        font-size: 24px;
      }
      .info .right .action {
        color: #8b8a8f;
        font-size: 12px;
      }

      /* CONTROLS */

      .heat_cool {
        --mode-color: var(--auto-color);
      }
      .cool {
        --mode-color: var(--cool-color);
      }
      .heat {
        --mode-color: var(--heat-color);
      }
      .manual {
        --mode-color: var(--manual-color);
      }
      .off {
        --mode-color: var(--off-color);
      }
      .fan_only {
        --mode-color: var(--fan_only-color);
      }
      .eco {
        --mode-color: var(--eco-color);
      }
      .dry {
        --mode-color: var(--dry-color);
      }
      .idle {
        --mode-color: var(--idle-color);
      }
      .unknown-mode {
        --mode-color: var(--unknown-color);
      }
      #controls {
        display: flex;
        justify-content: center;
        /* padding: 16px; */
        position: relative;
        /* width: 500px; */
        width: 100%;
      }
      #slider {
        height: 100%;
        width: 100%;
        position: relative;
        max-width: 300px;
        min-width: 250px;
      }
      round-slider {
        --round-slider-path-color: var(--disabled-text-color);
        --round-slider-bar-color: var(--mode-color);
        padding-bottom: 10%;
      }
      #slider-center {
        position: absolute;
        width: calc(100% - 120px);
        height: calc(100% - 120px);
        box-sizing: border-box;
        border-radius: 100%;
        left: 60px;
        top: 60px;
        text-align: center;
        overflow-wrap: break-word;
        pointer-events: none;
      }

      .values {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      }
      .values .action {
        color: #f4b941;
        font-size: 10px;
        text-transform: uppercase;
      }
      .values .value {
        color: #fff;
        font-size: 60px;
        line-height: 60px;
      }

      #modes > * {
        color: var(--disabled-text-color);
        cursor: pointer;
        display: inline-block;
      }
      #modes .selected-icon {
        --iron-icon-fill-color: var(--mode-color);
      }
      text {
        color: var(--primary-text-color);
      }
      /* Bottom Card Sensors Panel */
      .sensors-container {
        min-height: 64px;
        display: flex;
        flex: 1 1 120px;
        align-items: center;
        overflow: hidden;
      }
      .sensors {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        width: 100%;
      }
      .sensor {
        display: flex;
        align-items: center;
        flex-direction: column;
        width: 100px;
      }
      .sensor__label {
        font-size: 0.85em;
        opacity: 0.6;
        text-transform: uppercase;
        height: 2em;
        display: flex;
        text-align: center;
        align-items: center;
      }
      .sensor__value .b-temperature,
      .sensor__value .b-humidity {
        font-size: 2rem;
        line-height: 2rem;
        font-weight: 700;
      }
      /* Main Popup Top */
      .thermostat__body .b-temperature {
        font-weight: 700;
      }

      .popup-inner {
        color: white;
      }
      /* Thermostat Colors START */
      .popup-inner.temp-off {
        background: linear-gradient(rgb(159, 179, 194), rgb(104, 131, 150));
      }
      .popup-inner.temp-5 {
        background: linear-gradient(rgb(60, 150, 114), rgb(60, 134, 139));
      }
      .popup-inner.temp-6 {
        background: linear-gradient(rgb(60, 153, 115), rgb(57, 139, 142));
      }
      .popup-inner.temp-7 {
        background: linear-gradient(rgb(60, 158, 116), rgb(54, 144, 143));
      }
      .popup-inner.temp-8 {
        background: linear-gradient(rgb(61, 162, 117), rgb(51, 147, 142));
      }
      .popup-inner.temp-9 {
        background: linear-gradient(rgb(61, 166, 117), rgb(48, 149, 140));
      }
      .popup-inner.temp-10 {
        background: linear-gradient(rgb(61, 170, 118), rgb(45, 152, 138));
      }
      .popup-inner.temp-11 {
        background: linear-gradient(rgb(62, 174, 118), rgb(42, 154, 135));
      }
      .popup-inner.temp-12 {
        background: linear-gradient(rgb(62, 178, 119), rgb(40, 157, 132));
      }
      .popup-inner.temp-13 {
        background: linear-gradient(rgb(62, 182, 119), rgb(37, 159, 129));
      }
      .popup-inner.temp-14 {
        background: linear-gradient(rgb(62, 187, 119), rgb(34, 162, 125));
      }
      .popup-inner.temp-15 {
        background: linear-gradient(rgb(62, 191, 119), rgb(31, 164, 120));
      }
      .popup-inner.temp-16 {
        background: linear-gradient(rgb(63, 194, 119), rgb(28, 166, 116));
      }
      .popup-inner.temp-17 {
        background: linear-gradient(rgb(66, 196, 120), rgb(26, 169, 110));
      }
      .popup-inner.temp-18 {
        background: linear-gradient(rgb(68, 198, 120), rgb(23, 171, 105));
      }
      .popup-inner.temp-19 {
        background: linear-gradient(rgb(255, 208, 0), rgb(255, 187, 0));
      }
      .popup-inner.temp-20 {
        background: linear-gradient(rgb(255, 197, 0), rgb(255, 170, 0));
      }
      .popup-inner.temp-21 {
        background: linear-gradient(rgb(255, 186, 0), rgb(255, 153, 0));
      }
      .popup-inner.temp-22 {
        background: linear-gradient(rgb(255, 174, 0), rgb(255, 136, 0));
      }
      .popup-inner.temp-23 {
        background: linear-gradient(rgb(255, 163, 0), rgb(255, 119, 0));
      }
      .popup-inner.temp-24 {
        background: linear-gradient(rgb(255, 152, 0), rgb(255, 102, 0));
      }
      .popup-inner.temp-25 {
        background: linear-gradient(rgb(255, 140, 0), rgb(255, 85, 0));
      }
      /* Thermostat Colors END */
      .tado-card {
        display: flex;
        flex-direction: column;
        flex: 1 1 400px;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        width: 100%;
      }

      .room-thermostat-area:hover,
      .room-thermostat-area--slider:hover {
        transform: scale(1.03);
      }
      .room-thermostat-area.mousedown {
        transform: scale(0.95);
      }
      .room-thermostat-area {
        background-color: hsla(0, 0%, 100%, 0.2);
        box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
        transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
        will-change: transform;
        flex: 0 1 300px;
        position: relative;
        width: 100%;
        max-width: 300px;
        height: 300px;
        margin-top: 30px;
        background-color: hsla(0, 0%, 100%, 0.1);
        border-radius: 75px;
        overflow: hidden;
      }
      .thermostat {
        height: 100%;
        display: flex;
        flex-flow: column nowrap;
        text-align: center;
      }
      .thermostat__header_and_body {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .thermostat__header_and_body {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
      .thermostat__header_and_body[role='button'] {
        cursor: pointer;
      }
      .thermostat__header {
        flex-basis: 0;
        height: 0;
        position: relative;
        top: 14px;
        opacity: 0.6;
        transition: height 0.3s ease-in-out, top 0.3s ease-in-out, padding-top 0.3s ease-in-out;
      }
      .thermostat__body {
        position: relative;
        font-size: 6em;
        overflow: hidden;
        flex-basis: 100%;
        display: flex;
        flex-flow: column;
        justify-content: center;
        align-items: center;
        transition-property: width; /* Apply transition effect on the width */
        transition-duration: 1s; /* Transition will last 1 second */
        transition-timing-function: linear; /* Timing function to specify a linear transition type */
        transition-delay: 0s; /* Transition starts after 1 second */
      }
      .app-heat-request-indicator {
        position: absolute;
        display: inline-flex;
        bottom: 33px;
      }
      .app-heat-request-indicator svg path {
        opacity: 0.38;
        fill: #fff;
      }
      /* Temperature Slider */
      .tado-card--slider {
        flex: 0 1 400px;
        background-color: hsla(0, 0%, 100%, 0.2);
        box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
        transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
        will-change: transform;
        width: 100%;
        /* max-height: 120px; */
        overflow: hidden;
        min-height: 600px;
      }

      .temperature-slider--header {
        /* position: absolute; */
        /* left: 0; */
        /* right: 0; */
        /* top: 0; */
        height: 120px;
        display: flex;
      }
      .temperature-slider--toolbar {
        padding: 18px;
        position: absolute;
        width: calc(100% - 36px);
        display: flex;
        justify-content: space-between;
      }
      .panel-btn {
        width: 2em;
        height: 2em;
        border-radius: 2em;
        fill: hsla(0, 0%, 100%, 0.2);
      }
      .temperature-slider--header .value-label {
        font-size: 55px;
        align-self: center;
        flex: 1 1 auto;
        text-align: center;
        text-transform: uppercase;
      }
      .room-thermostat-area--slider {
        flex: 0 1 400px;
        background-color: hsla(0, 0%, 100%, 0.2);
        box-shadow: 0 0 30px hsla(0, 0%, 39.2%, 0.2);
        transition: transform 0.15s ease, box-shadow 0.15s ease, flex-basis 0.3s ease-out;
        will-change: transform;
        position: relative;
        width: 100%;
        max-width: 300px;
        /* height: 300px; */
        /* margin-top: 30px; */
        margin: 30px auto 60px auto;
        border-radius: 75px;
        overflow: hidden;
      }
      .app-temperature-slider {
        width: 300px;
        height: 400px;
        position: relative;
        top: 0;
        opacity: 1;
        left: 50%;
        transform: translateX(-50%);
      }
      [_nghost-uxt-c62] {
        display: block;
        position: relative;
        overflow: hidden;
      }
      .track {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        /* background-image: url(temperature-slider-bg.4cef948….svg); */
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="472" viewBox="0 0 450 472" fill="none"><path fill-rule="evenodd" clip-rule="evenodd" d="M199 22L0 22L3.93402e-05 472L450 472L450 22H251C251 36.3594 239.359 48 225 48C210.641 48 199 36.3594 199 22Z"    fill="white"  /><path fill-rule="evenodd" clip-rule="evenodd" d="M203 22C203 9.84974 212.85 0 225 0C237.15 0 247 9.84974 247 22C247 34.1503 237.15 44 225 44C212.85 44 203 34.1503 203 22ZM220 12L218.5 10.5L225 4L231.5 10.5L230 12L225 7L220 12ZM231.5 33.5L230 32L225 37L220 32L218.5 33.5L225 40L231.5 33.5Z"    fill="white"  /></svg>');
        background-position: center 0;
        background-repeat: no-repeat;
        background-clip: padding-box;
        padding: 22px 0 0;
        box-sizing: content-box;
      }
      input[type='range'] {
        background-color: transparent;
        -webkit-appearance: none;
        transform: rotate(-90deg);
        -ms-writing-mode: bt-lr;
        writing-mode: bt-lr;
        position: absolute;
        top: -22px;
      }
      input[type='range']::-webkit-slider-thumb {
        -webkit-appearance: none;
        border: 1px solid #000000;
        height: 36px;
        width: 16px;
        border-radius: 3px;
        background: #ffffff;
        cursor: pointer;
        margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
        box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
        visibility: hidden;
      }

      /* All the same stuff for Firefox */
      input[type='range']::-moz-range-thumb {
        box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
        border: 1px solid #000000;
        height: 36px;
        width: 16px;
        border-radius: 3px;
        background: #ffffff;
        cursor: pointer;
        visibility: hidden;
      }

      /* All the same stuff for IE */
      input[type='range']::-ms-thumb {
        box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
        border: 1px solid #000000;
        height: 36px;
        width: 16px;
        border-radius: 3px;
        background: #ffffff;
        cursor: pointer;
        visibility: hidden;
      }

      /* app-toolbar {
      color: var(--primary-text-color);
      background-color: linear-gradient(rgb(159, 179, 194), rgb(104, 131, 150));
    } */
      /* Main Popup Top */
    `;
  }
}

customElements.define('tado-popup-card', TadoPopupCard);

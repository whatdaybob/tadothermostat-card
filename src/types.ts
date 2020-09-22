import { ActionConfig, LovelaceCardConfig } from 'custom-card-helpers';

// TODO Add your configuration elements here for type-checking
export interface TadothermostatCardConfig extends LovelaceCardConfig {
  type: string;
  name?: string;
  show_warning?: boolean;
  show_error?: boolean;
  test_gui?: boolean;
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface TadothermostatpopupCardConfig extends LovelaceCardConfig {
  type: string;
  // name?: string;
  // show_warning?: boolean;
  // show_error?: boolean;
  // test_gui?: boolean;
  entity?: string;
  icon?: string;
  fullscreen?: boolean;
  offStates?: string[];
  onStates?: string[];
  actions?: any;
  actionSize?: string;
  actionsInARow?: number; // optional	3	number of actions that will be placed in a row under the brightness slider
  brightnessWidth?: string; // optional	150px	The width of the brightness slider
  brightnessHeight?: string; // optional	400px	The height of the brightness slider
  switchWidth?: string; // optional	150px	The width of the switch
  switchHeight?: string; // optional	400px	The height of the switch
  borderRadius?: string; // optional	12px	The border radius of the slider and switch
  sliderColor?: string; // optional	"#FFF"	The color of the slider
  sliderColoredByLight?: boolean; // optional	false	Let the color of the slider change based on the light color, this overwrites the sliderColor setting
  sliderThumbColor?: string; // optional	"#ddd"	The color of the line that you use to slide the slider
  sliderTrackColor?: string; // optional	"#ddd"	The color of the slider track
  settings?: boolean; // optional	false	When it will add an settings button that displays the more-info content
  settingsPosition?: string; // optional	bottom	set position of the settings button options: top or bottom.
  displayType?: string; // optional	auto	set the type of the card to force display slider of switch options: slider or switch.
  // tap_action?: ActionConfig;
  // hold_action?: ActionConfig;
  // double_tap_action?: ActionConfig;
}

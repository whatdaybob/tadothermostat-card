# Tadothermostat Card by [@whatdaybob](https://www.github.com/whatdaybob)

![HACS Validate](https://github.com/whatdaybob/tadothermostat-card/workflows/HACS%20Validate/badge.svg)
[![CodeFactor](https://www.codefactor.io/repository/github/whatdaybob/tadothermostat-card/badge/master)](https://www.codefactor.io/repository/github/whatdaybob/tadothermostat-card/overview/master)
[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)

A custom lovelace card to emulate the visuals of the tado application for your Home-Assistant tado climate entities.

I also have a popup that can further enhance this available at my [Tado Tadothermostat Popup Card](https://github.com/whatdaybob/tadothermostat-popup-card/) repository.

<!-- markdownlint-disable MD033 -->

<a href="https://www.buymeacoffee.com/whatdaybob" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/lato-orange.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 167px !important;" ></a>

<!-- markdownlint-enable MD033 -->

## Configuration

### Installation instructions

**HACS installation:**
Go to the hacs store and use the repo url `https://github.com/whatdaybob/tadothermostat-card` and add this as a custom repository under settings.

Add the following to your ui-lovelace.yaml:

```yaml
resources:
  url: /hacsfiles/tadothermostat-card/tadothermostat-card.js
  type: module
```

**Manual installation:**
Copy the .js file from the dist directory to your www directory and add the following to your ui-lovelace.yaml file:

```yaml
resources:
  url: /local/tadothermostat-card.js
  type: module
```

### Main Options

| Name     | Type   | Required     | Default | Description                                                    |
| -------- | ------ | ------------ | ------- | -------------------------------------------------------------- |
| `type`   | string | **Required** |         | `custom:tadothermostat-card`                                   |
| `name`   | string | **Required** |         | Name of the entity to be shown                                 |
| `entity` | string | **Required** |         | Entity of the tado climate integration (e.g `climate.hallway`) |

```yaml
- type: custom:tadothermostat-card
  name: Tado Thermostat Card Development
  entity: climate.hallway
```

<!-- markdownlint-disable MD033 -->

<a href="https://github.com/whatdaybob/tadothermostat-card/blob/master/media/screenshots/main.png" target="_blank"><img src="https://github.com/whatdaybob/tadothermostat-card/blob/master/media/screenshots/main.png" alt="Screenshot of thermostats" style="max-width: 100% !important;height: 500px !important;" ></a>

<!-- markdownlint-enable MD033 -->

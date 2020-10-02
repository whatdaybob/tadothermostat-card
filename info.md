<!-- markdownlint-disable MD041 -->

{%- if version_installed == "main" %}

<!-- markdownlint-enable MD041 -->

## You are running main!

This is **unfinished code** and only intended for development before a release!

<!-- markdownlint-disable MD011 -->

{%- elif (version_installed.split(".")[0] | int) < 1 %}

<!-- markdownlint-enable MD011 -->

# Breaking Changes

Read the release notes!
https://github.com/whatdaybob/tadothermostat-card/releases/tag/0.0.1

{% endif %}

## Useful links

- [GitHub](https://github.com/whatdaybob)
- [Become a GitHub sponsor? ❤️](https://github.com/sponsors/whatdaybob)
- [BuyMe~~Coffee~~Beer? 🍺🙈](https://buymeacoffee.com/whatdaybob)

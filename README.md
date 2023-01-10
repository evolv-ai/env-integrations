# env-integrations

Each folder in this repository is an Evolv integration package. Each of these follow a consistent mechanism for installation.

Here is a list of each npm package:

| Package       | NPM Link                                                     | Description                                                           |
|------------   |------------------------------------------------------------- | --------------------------------------------------------------------- |
| analytics     | https://www.npmjs.com/package/@evolv-delivery/analytics      | A generic analytics integration - using json                          |
| audience      | https://www.npmjs.com/package/@evolv-delivery/audience       | An integration to populate audience context via json                  | 
| behavioral    | https://www.npmjs.com/package/@evolv-delivery/behavioral     | Extendable intgration fo user tracking.                               |
| catalyst      | https://www.npmjs.com/package/@evolv-delivery/catalyst       | A rendering framework - alternative to mutate                         |
| emitter       | https://www.npmjs.com/package/@evolv-delivery/emitter        |                                                                       |
| lit-harness   | https://www.npmjs.com/package/@evolv-delivery/lit-harness    |                                                                       |
| spa-nvigation | https://www.npmjs.com/package/@evolv-delivery/spa-navigation |                                                                       |


## Setting up an integration in the Evolv Manager

### Add Integration
Create a new integration and add the latest version of this package (from npm) as a plugin as shown: 

|       |
| ----- |
| <img src="https://user-images.githubusercontent.com/54595/211390267-2a4fdb3e-acd0-49d7-a004-cceb908fd7c2.png" width="400"/> 

### Update Environment
Add the integration to an Environment and add the json config or leave empty. The configuration will vary for each integration. So read the documentation instructions for each integration you are installing

|       |
| ----- |
| <img src="https://user-images.githubusercontent.com/54595/211392207-cf35527f-b160-471b-9ded-cf923efc446f.png" width="400"/> 


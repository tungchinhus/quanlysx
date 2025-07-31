// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    <T>(id: string): T;
    keys(): string[];
  };
};

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Load the configuration for testing
import { convertYml, RsfConfigFactory } from '@rsf/rsf-angular-base';
const loadTestConfig = (async (file:string) => {
  const response = await fetch(file);
  const configText:string = await response.text();
  RsfConfigFactory.init(convertYml(configText));
});
loadTestConfig('./resources/app-local.yml'); // the test config file to load

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().forEach(context);

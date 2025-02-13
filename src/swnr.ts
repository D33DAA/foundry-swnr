/**
 * This is your TypeScript entry file for Foundry VTT.
 * Register custom settings, sheets, and constants using the Foundry API.
 * Change this heading to be more descriptive to your system, or remove it.
 * Author: [your name]
 * Content License: [copyright and-or license] If using an existing system
 * 					you may want to put a (link to a) license or copyright
 * 					notice here (e.g. the OGL).
 * Software License: [your license] Put your desired license here, which
 * 					 determines how others may use and modify your system
 */

// Import TypeScript modules
import { registerSettings } from "./module/settings";
import migrations from "./migrations/index";
import { preloadTemplates } from "./module/preloadTemplates";
import { SWNRActor, SWNRItem } from "./module/entities";

/* ------------------------------------ */
/* Initialize system					*/
/* ------------------------------------ */
Hooks.once("init", async function () {
  console.log("swnr | Initializing Stars Without Number Revised");

  // Assign custom classes and constants here

  // Register custom system settings
  registerSettings();
  CONFIG.Actor.entityClass = SWNRActor;
  CONFIG.Item.entityClass = SWNRItem;
  // Preload Handlebars templates
  await preloadTemplates();
  game.i18n.localize("swnr.title");

  // Remove stock sheets
  Actors.unregisterSheet("core", ActorSheet);
  Items.unregisterSheet("core", ItemSheet);

  Handlebars.registerHelper("debug", function () {
    return JSON.stringify(this, null, 2);
  });
  Handlebars.registerHelper("stringify", function (obj) {
    return JSON.stringify(obj, null, 2);
  });
  Handlebars.registerHelper("concat", function (a, b) {
    return a + b;
  });
});
declare let _templateCache: {
  [key: string]: (data: Record<string, unknown>) => string;
};
function limiter(fn: (...any: unknown[]) => unknown, wait: number) {
  let isCalled = false;

  return function () {
    if (!isCalled) {
      fn();
      isCalled = true;
      setTimeout(function () {
        isCalled = false;
      }, wait);
    }
  };
}
export const nukeTemplates = limiter(async function nukeTemplates() {
  Object.keys(_templateCache)
    .filter((e) => e.startsWith("systems/swnr"))
    .forEach((element) => {
      delete _templateCache[element];
    });
  await preloadTemplates();
}, 5000);

/* ------------------------------------ */
/* Setup system							*/
/* ------------------------------------ */
Hooks.once("setup", function () {
  // Do anything after initialization but before
  // ready
});

/* ------------------------------------ */
/* When ready							*/
/* ------------------------------------ */
Hooks.once("ready", function () {
  // Do anything once the system is ready
  // Reference a Compendium pack by it's collection ID
  // packImport();
  migrations();
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function packImport() {
  const moduleName = "swnr";
  const packName = "base-foci";
  // Add any additional hooks if necessary
  const pack: Compendium = game.packs.filter(
    (p) => p.collection === `${moduleName}.${packName}`
  )[0];

  // Load an external JSON data file which contains data for import
  const response = await fetch("systems/swnr/game-data/foci.json");
  const content = await response.json();
  content.forEach((element) => {
    element.type = "focus";
    element.data = {
      description: element.description,
      level1: element.level1,
      level2: element.level2,
    };
  });
  // Create temporary Actor entities which impose structure on the imported data
  const actors = Item.createMany(content, { temporary: true });

  // Save each temporary Actor into the Compendium pack
  for (const a of await actors) {
    await pack.importEntity(a);
    console.log(
      `Imported Actor ${a.name} into Compendium pack ${pack.collection}`
    );
  }
}

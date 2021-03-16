import { SWNRWeapon } from "../module/items/weapon";
import { registerMigration } from "../migration";

registerMigration(SWNRWeapon, "0.4.0", 0, (weapon, pastUpdates) => {
  if (!weapon.data.data.secondStat)
    pastUpdates["data.data.secondStat"] = "none";
  const stat = weapon.data.data.stat;
  if (stat.includes("/")) {
    const [first, second] = stat.split("/");
    pastUpdates["data.data.stat"] = first;
    pastUpdates["data.data.secondStat"] = second;
  }
  return pastUpdates;
});

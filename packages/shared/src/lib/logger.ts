import { createConsola, consola } from "consola";
import { pushToAuditTable } from "../data/auditLog";
import { IS_PROD } from "./constants";

const consolaWithReporters = createConsola({
  reporters: [
    {
      log: (logObj) => {
        if (logObj.level === 2) {
          console.log("<💩>", JSON.stringify(logObj));
        } else {
          // Push to audit log
          console.log("<💀>", JSON.stringify(logObj));

          if (typeof window === "undefined") {
            pushToAuditTable(logObj);
          }
        }
      },
    },
  ],
});

const Logger = IS_PROD ? consolaWithReporters : consola;

export { Logger };

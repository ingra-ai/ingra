import { createConsola } from 'consola';
import { pushToAuditTable } from '@/data/auditLog';

const Logger = createConsola({
  reporters: [
    {
      log: (logObj) => {
        if ( logObj.level === 2 ) {
          console.log('<💩>', JSON.stringify(logObj));
        }
        else {
          // Push to audit log
          console.log('<💀>', JSON.stringify(logObj));
          pushToAuditTable(logObj);
        }
      },
    },
  ],
});

export {
  Logger
};

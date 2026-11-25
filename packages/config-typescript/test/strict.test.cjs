const ts = require('typescript');
const path = require('node:path');
test.each(['apps/api','apps/web','packages/domain','packages/api-client','packages/ui'])('%s usa TypeScript estrito', workspace => {
  const config = ts.getParsedCommandLineOfConfigFile(path.resolve(workspace,'tsconfig.json'), {}, {...ts.sys, onUnRecoverableConfigFileDiagnostic(diagnostic) { throw new Error(String(diagnostic.messageText)); }});
  expect(config.options.strict).toBe(true);
});

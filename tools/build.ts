import { BunPlatform_Args_Has } from '../src/lib/ericchase/BunPlatform_Args_Has.js';
import { Step_Dev_Format } from './core-dev/step/Step_Dev_Format.js';
import { Step_Dev_Project_Update_Config } from './core-dev/step/Step_Dev_Project_Update_Config.js';
import { Processor_HTML_Custom_Component_Processor } from './core-web/processor/Processor_HTML_Custom_Component_Processor.js';
import { Step_Run_Dev_Server } from './core-web/step/Step_Run_Dev_Server.js';
import { Builder } from './core/Builder.js';
import { Processor_Set_Writable } from './core/processor/Processor_Set_Writable.js';
import { Processor_TypeScript_Generic_Bundler } from './core/processor/Processor_TypeScript_Generic_Bundler.js';
import { Step_Bun_Run } from './core/step/Step_Bun_Run.js';
import { Step_FS_Clean_Directory } from './core/step/Step_FS_Clean_Directory.js';

// await AddLoggerOutputDirectory('cache');

if (BunPlatform_Args_Has('--dev')) {
  Builder.SetMode(Builder.MODE.DEV);
}
Builder.SetVerbosity(Builder.VERBOSITY._1_LOG);

Builder.SetStartUpSteps(
  Step_Dev_Project_Update_Config({ project_path: '.' }),
  Step_Bun_Run({ cmd: ['bun', 'update', '--latest'], showlogs: false }),
  Step_Bun_Run({ cmd: ['bun', 'install'], showlogs: false }),
  Step_FS_Clean_Directory(Builder.Dir.Out),
  Step_Dev_Format({ showlogs: false }),
  //
);

Builder.SetProcessorModules(
  Processor_HTML_Custom_Component_Processor(),
  Processor_TypeScript_Generic_Bundler({}, { bundler_mode: 'iife' }),
  Processor_TypeScript_Generic_Bundler({}, { bundler_mode: 'module' }),
  Processor_Set_Writable({ include_patterns: ['**/*'], value: true }),
  //
);

Builder.SetAfterProcessingSteps(
  Step_Run_Dev_Server(),
  //
);

await Builder.Start();
